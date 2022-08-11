// Copyright © 2012-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;
using System.Activities.XamlIntegration;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Workflow;

public enum WorkflowType
{
	Unknown,
	ClrType,
	File,
	Definition,
	Db
}

internal class WorkflowDefinition
{
	public String Source { get; private set; }
	public String Name { get; private set; }
	public String Path { get; private set; }
	public WorkflowType Type { get; private set; }
	public String Assembly { get; private set; }

	public String Definition { get; private set; }
	public WorkflowIdentity Identity { get; private set; }

	Int32 Version
	{
		get
		{
			if (String.IsNullOrEmpty(Name))
				return 1;
			Int32 pos = Name.LastIndexOf("_v");
			if (pos == -1)
				return 1;
			return Int32.Parse(Name.Substring(pos + 2));
		}
	}

	public Boolean Cached { get; private set; }


	private WorkflowDefinition(String name, String definition)
	{
		Name = name;
		Definition = definition;
		Type = WorkflowType.Definition;
		Identity = new WorkflowIdentity(Name, new Version(Version, 0), null);
	}

	private WorkflowDefinition(String source)
	{
		// clr:A2.Workflows
		// file:fullName
		Source = source.Trim();
		if (Source.StartsWith("clr:"))
		{
			var (assembly, type) = ClrHelpers.ParseClrType(source);
			Name = type;
			Assembly = assembly;
		}
		else if (Source.StartsWith("file:"))
		{
			Type = WorkflowType.File;
			Path = Source.Substring(5).Trim();
			Name = System.IO.Path.GetFileNameWithoutExtension(Path);
		}
		else if (Source.StartsWith("db:"))
		{
			Type = WorkflowType.Db;
			Path = Source.Substring(3).Trim();
			Name = System.IO.Path.GetFileNameWithoutExtension(Path);
		}
		else
		{
			throw new WorkflowException($"Invalid workflow source ('{Source}')");
		}
		Identity = new WorkflowIdentity(Name, new Version(Version, 0), null);
	}

	public static WorkflowDefinition Create(String source)
	{
		var def = new WorkflowDefinition(source);
		return def;
	}

	public static WorkflowDefinition Load(InboxInfo info)
	{
		return new WorkflowDefinition(info.Kind, info.Definition);
	}

	public static WorkflowDefinition Load(ProcessInfo info)
	{
		return new WorkflowDefinition(info.Kind, info.Definition);
	}

	String GetWorkflowFullPath(IApplicationHost host)
	{
		String fullPath = System.IO.Path.Combine(host.AppPath, host.AppKey ?? String.Empty, Path);
		fullPath = System.IO.Path.ChangeExtension(fullPath, "xaml");
		fullPath = System.IO.Path.GetFullPath(fullPath);
		return fullPath;
	}

	String GetHashedName()
	{
		HashAlgorithm algorithm = MD5.Create();
		var hash = algorithm.ComputeHash(Encoding.UTF8.GetBytes(Definition));
		StringBuilder sb = new StringBuilder(Name);
		sb.Append("_");
		foreach (Byte b in hash)
		{
			sb.Append(b.ToString("x2"));
		}
		return sb.ToString();
	}


	public Boolean IsActivityCached => RuntimeActivity.IsTypeCached(GetHashedName());


	public Activity LoadFromDefinition()
	{
		if (Type != WorkflowType.Definition)
			throw new InvalidOperationException("Invalid WorkflowDefinition type. Expected 'WorkflowType.Definition'");
		using (var sr = new StringReader(Definition))
		{
			Activity root = ActivityXamlServices.Load(sr) as Activity;
			Cached = RuntimeActivity.Compile(GetHashedName(), root);
			return root;
		}
	}

	public Activity LoadFromSource(IApplicationHost host, IDbContext dbContext)
	{
		if (Type == WorkflowType.File)
		{
			String fullPath = GetWorkflowFullPath(host);
			using (var sr = new StreamReader(fullPath))
			{
				Definition = sr.ReadToEnd();
				sr.BaseStream.Seek(0, SeekOrigin.Begin);
				using (var xr = ActivityXamlServices.CreateReader(sr.BaseStream))
				{
					var root = ActivityXamlServices.Load(xr);
					RuntimeActivity.Compile(GetHashedName(), root);
					return root;
				}
			}
		}
		else if  (Type ==WorkflowType.Db)
		{
			var fullPath = Path.Replace('\\', '/').ToLowerInvariant();
			fullPath = System.IO.Path.ChangeExtension(fullPath, ".xaml");
			var appStream = dbContext.Load<AppStream>(null, "a2sys.LoadApplicationFile", new { Path = fullPath });
			if (appStream.Stream == null)
				throw new WorkflowException($"There is no definition for '{fullPath}'");
			Definition = appStream.Stream;
			using (var sr = new StringReader(appStream.Stream))
			{
				Activity root = ActivityXamlServices.Load(sr) as Activity;
				Cached = RuntimeActivity.Compile(GetHashedName(), root);
				return root;
			}
		}
		else if (Type == WorkflowType.ClrType)
		{
			return System.Activator.CreateInstance(Assembly, Name).Unwrap() as Activity;
		}
		else if (Type == WorkflowType.Definition)
		{
			using (var sr = new StringReader(Definition))
			{
				Activity root = ActivityXamlServices.Load(sr) as Activity;
				Cached = RuntimeActivity.Compile(GetHashedName(), root);
				return root;
			}
		}
		else
		{
			throw new NotImplementedException($"WorkflowDefinition. Invalid WorkflowType. Type={Type.ToString()}");
		}
	}
}
