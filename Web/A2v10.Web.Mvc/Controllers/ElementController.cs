using System;
using System.Threading.Tasks;
using System.Web.Mvc;

using A2v10.Infrastructure;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Models;
using System.IO;
using Newtonsoft.Json;
using System.Dynamic;
using Newtonsoft.Json.Converters;
using System.Text;
using System.Web;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
    public class ElementController : BaseController
    {
        public ElementController(IApplicationHost host, IDbContext dbContext, IRenderer renderer)
            : base(host, dbContext, renderer)
        {
        }

        [IsAjaxOnly]
        public async Task Dialog(String pathInfo)
        {
            await RenderElementKind(RequestUrlKind.Dialog, pathInfo);
        }

        [IsAjaxOnly]
        public async Task Popup(String pathInfo)
        {
            await RenderElementKind(RequestUrlKind.Popup, pathInfo);
        }

        [IsAjaxOnly]
        public ActionResult Invoke(String pathInfo)
        {
            throw new NotImplementedException();
        }

        [IsAjaxOnly]
        public async Task Data(String command)
        {
            try
            {
                switch (command.ToLowerInvariant())
                {
                    case "save":
                        await SaveData();
                        break;
                    case "reload":
                        await ReloadData();
                        break;
                    default:
                        throw new RequestModelException($"Invalid data action {command}");
                }
            }
            catch (Exception ex)
            {
                WriteExceptionStatus(ex);
            }
        }

        async Task SaveData()
        {
            ExpandoObject dataToSave;
            using (var tr = new StreamReader(Request.InputStream))
            {
                String json = tr.ReadToEnd();
                dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            }
            String baseUrl = dataToSave.Get<String>("baseUrl");
            ExpandoObject data = dataToSave.Get<ExpandoObject>("data");
            var rm = await RequestModel.CreateFromBaseUrl(_host, baseUrl);
            RequestView rw = rm.GetCurrentAction();
            var prms = new
            {
                UserId = UserId
            };
            IDataModel model = await _dbContext.SaveModelAsync(rw.CurrentSource, rw.UpdateProcedure, data, prms);
            WriteDataModel(model);
        }

        void WriteDataModel(IDataModel model)
        {
            Response.ContentType = "application/json";
            Response.ContentEncoding = Encoding.UTF8;
            Response.HeaderEncoding = Encoding.UTF8;
            // Write data to output
            Response.Write(JsonConvert.SerializeObject(model.Root, StandardSerializerSettings));
        }

        async Task ReloadData()
        {
            ExpandoObject dataToSave;
            using (var tr = new StreamReader(Request.InputStream))
            {
                String json = tr.ReadToEnd();
                dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            }
            String baseUrl = dataToSave.Get<String>("baseUrl");

            ExpandoObject loadPrms = new ExpandoObject();
            if (baseUrl.Contains("?"))
            {
                var parts = baseUrl.Split('?');
                baseUrl = parts[0];
                // parts[1] contains query parameters
                var qryParams = HttpUtility.ParseQueryString(parts[1]);
                loadPrms.Append(qryParams, toPascalCase: true);
            }

            if (baseUrl == null)
                throw new RequestModelException("There are not base url for command 'reload'");

            var rm = await RequestModel.CreateFromBaseUrl(_host, baseUrl);
            RequestView rw = rm.GetCurrentAction();
            String loadProc = rw.LoadProcedure;
            if (loadProc == null)
                throw new RequestModelException("The data model is empty");
            loadPrms.Set("UserId", UserId);
            loadPrms.Set("Id", rw.Id);
            IDataModel model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
            WriteDataModel(model);
        }
    }
}
