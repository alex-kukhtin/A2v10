// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using System.Threading.Tasks;

using System.Dynamic;
using System.Text;
using System.Net;
using System.Collections.Generic;

using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

using Microsoft.AspNet.Identity;

using Newtonsoft.Json;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Mvc.Identity;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
	public class ShellController : Controller
	{
        A2v10.Request.BaseController _baseController = new BaseController();

        public Int64 UserId
        {
            get
            {
                return User.Identity.GetUserId<Int64>();
            }
        }

        protected String RootUrl
        {
            get
            {
                String url = _baseController.Admin ? Url.Content("~/admin") : Url.Content("~");
                if (url == "/")
                    url = String.Empty;
                if (url.EndsWith("/"))
                    url = url.Substring(url.Length - 1);
                return url;
            }
        }

        public async Task Default(String pathInfo)
        {
            // simple routing
            Response.ContentEncoding = Encoding.UTF8;
            Response.HeaderEncoding = Encoding.UTF8;
            if (String.IsNullOrEmpty(pathInfo))
            {
                Index(); // root
                return;
            }
            pathInfo = pathInfo.ToLowerInvariant();
            if (pathInfo.StartsWith("admin/"))
            {
                pathInfo = pathInfo.Substring(6);
                // ADMIN mode
                _baseController.Admin = true;
            }

            if (pathInfo.StartsWith("shellscript"))
            {
                await ShellScript(pathInfo.Contains("admin"));
            }
            else if (pathInfo.StartsWith("_page/"))
            {
                await Render(pathInfo.Substring(6), RequestUrlKind.Page);
            }
            else if (pathInfo.StartsWith("_dialog/"))
            {
                await Render(pathInfo.Substring(8), RequestUrlKind.Dialog);
            }
            else if (pathInfo.StartsWith("_popup/"))
            {
                await Render(pathInfo.Substring(7), RequestUrlKind.Popup);
            }
            else if (pathInfo.StartsWith("_data/"))
            {
                String command = pathInfo.Substring(6);
                await Data(command);
            }
            else if (pathInfo.StartsWith("_image/"))
            {
                await Image("/" + pathInfo); // with _image prefix
            }
            else
            {
                Index(); // root element (always)
            }
        }

        public void Index()
        {
            try
            {
                Response.ContentType = "text/html";
                var prms = new Dictionary<String, String>();
                prms.Add("$(RootUrl)", RootUrl);
                prms.Add("$(PersonName)", User.Identity.GetUserPersonName());
                _baseController.Layout(Response.Output, prms);
            }
            catch (Exception ex)
            {
                _baseController.WriteHtmlException(ex, Response.Output);
            }
        }

        async Task Render(String pathInfo, RequestUrlKind kind)
        {
            //  Ajax
            if (IsNotAjax())
                return;
            try
            {
                Response.ContentType = "text/html";
                ExpandoObject loadPrms = new ExpandoObject();
                loadPrms.Append(Request.QueryString, toPascalCase: true);
                loadPrms.Set("UserId", UserId);
                await _baseController.RenderElementKind(kind, pathInfo, loadPrms, Response.Output);
            }
            catch (Exception ex)
            {
                _baseController.WriteHtmlException(ex, Response.Output);
            }
        }

        Boolean IsNotAjax()
        {
            if (Request.IsAjaxRequest())
                return false;
            Response.StatusCode = 404;
            return true;
        }

        async Task Data(String command)
        {
            //  Ajax
            if (IsNotAjax())
                return;
            if (Request.HttpMethod != "POST")
                return;
            Response.ContentType = "application/json";
            try
            {

                using (var tr = new StreamReader(Request.InputStream))
                {
                    String json = tr.ReadToEnd();
                    await _baseController.Data(command, UserId, json, Response.Output);
                }
            }
            catch (Exception ex)
            {
                WriteExceptionStatus(ex);
            }
        }

        async Task Image(String url)
        {
            if (Request.HttpMethod == "POST")
            {
                await SaveImage(url);
            }
            else
            {
                await LoadImage(url);
            }
        }

        async Task LoadImage(String url)
        { 
            try
            {
                ImageInfo info = await _baseController.Image(url, UserId);
                if (info == null)
                    return;
                Response.ContentType = info.Mime;
                if (info.Stream == null)
                    return;
                Response.BinaryWrite(info.Stream);
            }
            catch (Exception ex)
            {
                Response.ContentType = "image/png";
                if (ex.InnerException != null)
                    ex = ex.InnerException;
                var b = new Bitmap(380, 30);
                var g = Graphics.FromImage(b);
                g.FillRectangle(Brushes.LavenderBlush, new Rectangle(0, 0, 380, 30));
                g.DrawString(ex.Message, SystemFonts.SmallCaptionFont, Brushes.DarkRed, 5, 5, StringFormat.GenericTypographic);
                g.Save();
                b.Save(Response.OutputStream, ImageFormat.Png);
            }
        }

        async Task SaveImage(String url)
        {
            if (IsNotAjax())
                return;
            Response.ContentType = "application/json";
            try
            {
                var files = Request.Files;
                var list= await _baseController.SaveImages(url, files, UserId);
                var rval = new ExpandoObject();
                rval.Set("status", "OK");
                rval.Set("ids", list);
                String result = JsonConvert.SerializeObject(rval, BaseController.StandardSerializerSettings);
                Response.Write(result);
            }
            catch (Exception ex)
            {
                WriteExceptionStatus(ex);
            }
        }

        async Task ShellScript(Boolean admin)
        {
            Response.ContentType = "application/javascript";
            try
            {
                await _baseController.ShellScript(UserId, admin, Response.Output);
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                    ex = ex.InnerException;
                Response.Write($"alert('{ex.Message.EncodeJs()}')");
            }
        }

        protected void WriteExceptionStatus(Exception ex)
        {
            if (ex.InnerException != null)
                ex = ex.InnerException;
            Response.SuppressContent = false;
            Response.StatusCode = 255; // CUSTOM ERROR!!!!
            Response.ContentType = "text/plain";
            Response.StatusDescription = "Custom server error";
            Response.Write(ex.Message);
        }
    }
}
