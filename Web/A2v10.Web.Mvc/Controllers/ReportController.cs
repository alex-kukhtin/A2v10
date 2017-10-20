using System;
using System.Web.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using A2v10.Infrastructure;
using System.Net;
using A2v10.Request;
using Stimulsoft.Report.Mvc;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
    public class ReportController : Controller
    {
        A2v10.Request.BaseController _baseController = new BaseController();

        public ReportController()
        {
        }

        public void Show(String Base, String Rep, String id)
        {
            try
            {
            }
            catch (Exception ex)
            {
                _baseController.WriteHtmlException(ex, Response.Output);
            }
        }


        public ActionResult ViewerEvent()
        {
            return StiMvcViewer.ViewerEventResult(HttpContext);
        }

        public ActionResult PrintReport()
        {
            return StiMvcViewer.PrintReportResult(HttpContext);
        }

        public FileResult ExportReport()
        {
            return StiMvcViewer.ExportReportResult(HttpContext);
        }

        public ActionResult Interaction()
        {
            return StiMvcViewer.InteractionResult(HttpContext);
        }

    }
}
