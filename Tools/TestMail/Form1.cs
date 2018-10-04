using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TestMail
{
	public partial class Form1 : Form
	{
		public Form1()
		{
			InitializeComponent();
		}

		private void button1_Click(Object sender, EventArgs e)
		{
			try
			{
				using (var smtp = new SmtpClient(txtHost.Text, Convert.ToInt32(txtPort.Text)))
				{
					smtp.DeliveryFormat = SmtpDeliveryFormat.International;
					smtp.EnableSsl = chkEnableSSL.Checked;
					smtp.UseDefaultCredentials = false;
					smtp.Credentials = new NetworkCredential(txtUser.Text, txtPassword.Text);
					smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
					smtp.SendCompleted += Smtp_SendCompleted;
					using (var mm = new MailMessage())
					{
						mm.Subject = "Test Message Subject";
						mm.Body = "Test Message Body";
						mm.To.Add(new MailAddress(txtSendTo.Text));
						mm.From = new MailAddress(txtSendFrom.Text);
						smtp.Send(mm);
					}
				}
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				MessageBox.Show(ex.Message);
			}
		}

		private void Smtp_SendCompleted(Object sender, AsyncCompletedEventArgs e)
		{
			if (e.Error != null)
				MessageBox.Show(e.Error.Message);
			else
				MessageBox.Show("Success");
		}

		private void Form1_Load(Object sender, EventArgs e)
		{

		}
	}
}
