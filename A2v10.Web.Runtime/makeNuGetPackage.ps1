 param (
    [Parameter(Mandatory=$true)][string]$target,
    [string]$ConfigurationName = $(throw "-ConfigurationName is required.")
);

if ($ConfigurationName -ne "Release") {
	Exit;
}

Set-Location -Path $target;

..\Tools\BuildSql\bin\Release\BuildSql.exe ..\SqlScripts

$SourceScripts = @("main.js", "d3.min.js", "vue.js", "vue.min.js", "locale-*.min.js");
$SourceStyles = @("site.css", "site.min.css");
$SourceSql = @("a2v10system.sql", "a2v10security.sql", "a2v10messaging.sql", "a2v10ui.sql", "a2v10workflow.sql", "a2v10api.sql");
$i = 0;

foreach ($elem in $SourceScripts) {
   Copy-Item "..\Web\A2v10.Web.Site\scripts\$($elem)" -Destination ".\scripts";
   $i += 1;
}

foreach ($elem in $SourceStyles) {
   Copy-Item "..\Web\A2v10.Web.Site\css\$($elem)" -Destination ".\css";
   $i += 1;
}

Copy-Item "..\Web\A2v10.Web.Site\css\fonts\*.*" -Destination ".\css\fonts";
$i += 1;

Copy-Item "..\Web\A2v10.Web.Site\localization\*.*" -Destination ".\localization";
$i += 1;

foreach ($elem in $SourceSql) {
   Copy-Item "..\SqlScripts\$($elem)" -Destination ".\App_application\@sql\platform\source";
   $i += 1;
}

Copy-Item "..\SqlScripts\a2v10platform.sql" -Destination ".\App_application\@sql\platform";
$i += 1;


Write-Host "Successfully copied client files.";

Remove-item -Path "C:\A2v10_Net48\Nuget.local\*.*";

# nuget.exe pack -OutputDirectory "d:\NuGet.Local" -Prop Configuration=Release;

