namespace TestMail
{
	partial class Form1
	{
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Windows Form Designer generated code

		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.button1 = new System.Windows.Forms.Button();
			this.chkEnableSSL = new System.Windows.Forms.CheckBox();
			this.txtHost = new System.Windows.Forms.TextBox();
			this.label1 = new System.Windows.Forms.Label();
			this.txtPort = new System.Windows.Forms.TextBox();
			this.label2 = new System.Windows.Forms.Label();
			this.label3 = new System.Windows.Forms.Label();
			this.txtUser = new System.Windows.Forms.TextBox();
			this.txtPassword = new System.Windows.Forms.TextBox();
			this.label4 = new System.Windows.Forms.Label();
			this.label5 = new System.Windows.Forms.Label();
			this.txtSendTo = new System.Windows.Forms.TextBox();
			this.txtSendFrom = new System.Windows.Forms.TextBox();
			this.label6 = new System.Windows.Forms.Label();
			this.SuspendLayout();
			// 
			// button1
			// 
			this.button1.Location = new System.Drawing.Point(15, 240);
			this.button1.Name = "button1";
			this.button1.Size = new System.Drawing.Size(252, 36);
			this.button1.TabIndex = 0;
			this.button1.Text = "Send";
			this.button1.UseVisualStyleBackColor = true;
			this.button1.Click += new System.EventHandler(this.button1_Click);
			// 
			// chkEnableSSL
			// 
			this.chkEnableSSL.AutoSize = true;
			this.chkEnableSSL.Checked = true;
			this.chkEnableSSL.CheckState = System.Windows.Forms.CheckState.Checked;
			this.chkEnableSSL.Location = new System.Drawing.Point(71, 123);
			this.chkEnableSSL.Name = "chkEnableSSL";
			this.chkEnableSSL.Size = new System.Drawing.Size(68, 17);
			this.chkEnableSSL.TabIndex = 1;
			this.chkEnableSSL.Text = "Use SSL";
			this.chkEnableSSL.UseVisualStyleBackColor = true;
			// 
			// txtHost
			// 
			this.txtHost.Location = new System.Drawing.Point(71, 19);
			this.txtHost.Name = "txtHost";
			this.txtHost.Size = new System.Drawing.Size(193, 20);
			this.txtHost.TabIndex = 2;
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point(12, 22);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(29, 13);
			this.label1.TabIndex = 3;
			this.label1.Text = "Host";
			// 
			// txtPort
			// 
			this.txtPort.Location = new System.Drawing.Point(71, 45);
			this.txtPort.Name = "txtPort";
			this.txtPort.Size = new System.Drawing.Size(78, 20);
			this.txtPort.TabIndex = 2;
			// 
			// label2
			// 
			this.label2.AutoSize = true;
			this.label2.Location = new System.Drawing.Point(12, 48);
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size(26, 13);
			this.label2.TabIndex = 3;
			this.label2.Text = "Port";
			// 
			// label3
			// 
			this.label3.AutoSize = true;
			this.label3.Location = new System.Drawing.Point(12, 74);
			this.label3.Name = "label3";
			this.label3.Size = new System.Drawing.Size(29, 13);
			this.label3.TabIndex = 3;
			this.label3.Text = "User";
			// 
			// txtUser
			// 
			this.txtUser.Location = new System.Drawing.Point(71, 71);
			this.txtUser.Name = "txtUser";
			this.txtUser.Size = new System.Drawing.Size(193, 20);
			this.txtUser.TabIndex = 2;
			// 
			// txtPassword
			// 
			this.txtPassword.Location = new System.Drawing.Point(71, 97);
			this.txtPassword.Name = "txtPassword";
			this.txtPassword.Size = new System.Drawing.Size(193, 20);
			this.txtPassword.TabIndex = 2;
			// 
			// label4
			// 
			this.label4.AutoSize = true;
			this.label4.Location = new System.Drawing.Point(12, 100);
			this.label4.Name = "label4";
			this.label4.Size = new System.Drawing.Size(53, 13);
			this.label4.TabIndex = 3;
			this.label4.Text = "Password";
			// 
			// label5
			// 
			this.label5.AutoSize = true;
			this.label5.Location = new System.Drawing.Point(12, 163);
			this.label5.Name = "label5";
			this.label5.Size = new System.Drawing.Size(48, 13);
			this.label5.TabIndex = 3;
			this.label5.Text = "Send To";
			// 
			// txtSendTo
			// 
			this.txtSendTo.Location = new System.Drawing.Point(71, 160);
			this.txtSendTo.Name = "txtSendTo";
			this.txtSendTo.Size = new System.Drawing.Size(193, 20);
			this.txtSendTo.TabIndex = 2;
			// 
			// txtSendFrom
			// 
			this.txtSendFrom.Location = new System.Drawing.Point(71, 186);
			this.txtSendFrom.Name = "txtSendFrom";
			this.txtSendFrom.Size = new System.Drawing.Size(193, 20);
			this.txtSendFrom.TabIndex = 2;
			// 
			// label6
			// 
			this.label6.AutoSize = true;
			this.label6.Location = new System.Drawing.Point(12, 189);
			this.label6.Name = "label6";
			this.label6.Size = new System.Drawing.Size(58, 13);
			this.label6.TabIndex = 3;
			this.label6.Text = "Send From";
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(276, 303);
			this.Controls.Add(this.label2);
			this.Controls.Add(this.label4);
			this.Controls.Add(this.label6);
			this.Controls.Add(this.label5);
			this.Controls.Add(this.label3);
			this.Controls.Add(this.label1);
			this.Controls.Add(this.txtPort);
			this.Controls.Add(this.txtSendFrom);
			this.Controls.Add(this.txtSendTo);
			this.Controls.Add(this.txtPassword);
			this.Controls.Add(this.txtUser);
			this.Controls.Add(this.txtHost);
			this.Controls.Add(this.chkEnableSSL);
			this.Controls.Add(this.button1);
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
			this.MaximizeBox = false;
			this.MinimizeBox = false;
			this.Name = "Form1";
			this.ShowIcon = false;
			this.Text = "Test SMTP mail";
			this.Load += new System.EventHandler(this.Form1_Load);
			this.ResumeLayout(false);
			this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.Button button1;
		private System.Windows.Forms.CheckBox chkEnableSSL;
		private System.Windows.Forms.TextBox txtHost;
		private System.Windows.Forms.Label label1;
		private System.Windows.Forms.TextBox txtPort;
		private System.Windows.Forms.Label label2;
		private System.Windows.Forms.Label label3;
		private System.Windows.Forms.TextBox txtUser;
		private System.Windows.Forms.TextBox txtPassword;
		private System.Windows.Forms.Label label4;
		private System.Windows.Forms.Label label5;
		private System.Windows.Forms.TextBox txtSendTo;
		private System.Windows.Forms.TextBox txtSendFrom;
		private System.Windows.Forms.Label label6;
	}
}

