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
			this.txtSettings = new System.Windows.Forms.TextBox();
			this.label7 = new System.Windows.Forms.Label();
			this.txtMethod = new System.Windows.Forms.TextBox();
			this.label8 = new System.Windows.Forms.Label();
			this.txtDirectory = new System.Windows.Forms.TextBox();
			this.label9 = new System.Windows.Forms.Label();
			this.SuspendLayout();
			// 
			// button1
			// 
			this.button1.Location = new System.Drawing.Point(20, 514);
			this.button1.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.button1.Name = "button1";
			this.button1.Size = new System.Drawing.Size(336, 44);
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
			this.chkEnableSSL.Location = new System.Drawing.Point(95, 151);
			this.chkEnableSSL.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.chkEnableSSL.Name = "chkEnableSSL";
			this.chkEnableSSL.Size = new System.Drawing.Size(80, 20);
			this.chkEnableSSL.TabIndex = 1;
			this.chkEnableSSL.Text = "Use SSL";
			this.chkEnableSSL.UseVisualStyleBackColor = true;
			// 
			// txtHost
			// 
			this.txtHost.Location = new System.Drawing.Point(95, 23);
			this.txtHost.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtHost.Name = "txtHost";
			this.txtHost.Size = new System.Drawing.Size(256, 22);
			this.txtHost.TabIndex = 2;
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point(16, 27);
			this.label1.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(36, 16);
			this.label1.TabIndex = 3;
			this.label1.Text = "Host";
			// 
			// txtPort
			// 
			this.txtPort.Location = new System.Drawing.Point(95, 55);
			this.txtPort.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtPort.Name = "txtPort";
			this.txtPort.Size = new System.Drawing.Size(103, 22);
			this.txtPort.TabIndex = 2;
			// 
			// label2
			// 
			this.label2.AutoSize = true;
			this.label2.Location = new System.Drawing.Point(16, 59);
			this.label2.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size(32, 16);
			this.label2.TabIndex = 3;
			this.label2.Text = "Port";
			// 
			// label3
			// 
			this.label3.AutoSize = true;
			this.label3.Location = new System.Drawing.Point(16, 91);
			this.label3.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label3.Name = "label3";
			this.label3.Size = new System.Drawing.Size(37, 16);
			this.label3.TabIndex = 3;
			this.label3.Text = "User";
			// 
			// txtUser
			// 
			this.txtUser.Location = new System.Drawing.Point(95, 87);
			this.txtUser.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtUser.Name = "txtUser";
			this.txtUser.Size = new System.Drawing.Size(256, 22);
			this.txtUser.TabIndex = 2;
			// 
			// txtPassword
			// 
			this.txtPassword.Location = new System.Drawing.Point(95, 119);
			this.txtPassword.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtPassword.Name = "txtPassword";
			this.txtPassword.Size = new System.Drawing.Size(256, 22);
			this.txtPassword.TabIndex = 2;
			// 
			// label4
			// 
			this.label4.AutoSize = true;
			this.label4.Location = new System.Drawing.Point(16, 123);
			this.label4.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label4.Name = "label4";
			this.label4.Size = new System.Drawing.Size(68, 16);
			this.label4.TabIndex = 3;
			this.label4.Text = "Password";
			// 
			// label5
			// 
			this.label5.AutoSize = true;
			this.label5.Location = new System.Drawing.Point(16, 201);
			this.label5.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label5.Name = "label5";
			this.label5.Size = new System.Drawing.Size(60, 16);
			this.label5.TabIndex = 3;
			this.label5.Text = "Send To";
			// 
			// txtSendTo
			// 
			this.txtSendTo.Location = new System.Drawing.Point(95, 197);
			this.txtSendTo.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtSendTo.Name = "txtSendTo";
			this.txtSendTo.Size = new System.Drawing.Size(256, 22);
			this.txtSendTo.TabIndex = 2;
			// 
			// txtSendFrom
			// 
			this.txtSendFrom.Location = new System.Drawing.Point(95, 229);
			this.txtSendFrom.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtSendFrom.Name = "txtSendFrom";
			this.txtSendFrom.Size = new System.Drawing.Size(256, 22);
			this.txtSendFrom.TabIndex = 2;
			// 
			// label6
			// 
			this.label6.AutoSize = true;
			this.label6.Location = new System.Drawing.Point(16, 233);
			this.label6.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label6.Name = "label6";
			this.label6.Size = new System.Drawing.Size(74, 16);
			this.label6.TabIndex = 3;
			this.label6.Text = "Send From";
			// 
			// txtSettings
			// 
			this.txtSettings.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
			this.txtSettings.Location = new System.Drawing.Point(20, 375);
			this.txtSettings.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtSettings.Multiline = true;
			this.txtSettings.Name = "txtSettings";
			this.txtSettings.Size = new System.Drawing.Size(331, 109);
			this.txtSettings.TabIndex = 4;
			this.txtSettings.Leave += new System.EventHandler(this.txtSettings_Leave);
			// 
			// label7
			// 
			this.label7.AutoSize = true;
			this.label7.Location = new System.Drawing.Point(23, 356);
			this.label7.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label7.Name = "label7";
			this.label7.Size = new System.Drawing.Size(109, 16);
			this.label7.TabIndex = 5;
			this.label7.Text = "mailSettings.json";
			// 
			// txtMethod
			// 
			this.txtMethod.Location = new System.Drawing.Point(95, 289);
			this.txtMethod.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtMethod.Name = "txtMethod";
			this.txtMethod.Size = new System.Drawing.Size(256, 22);
			this.txtMethod.TabIndex = 6;
			// 
			// label8
			// 
			this.label8.AutoSize = true;
			this.label8.Location = new System.Drawing.Point(16, 293);
			this.label8.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label8.Name = "label8";
			this.label8.Size = new System.Drawing.Size(53, 16);
			this.label8.TabIndex = 7;
			this.label8.Text = "Method";
			// 
			// txtDirectory
			// 
			this.txtDirectory.Location = new System.Drawing.Point(95, 321);
			this.txtDirectory.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.txtDirectory.Name = "txtDirectory";
			this.txtDirectory.Size = new System.Drawing.Size(256, 22);
			this.txtDirectory.TabIndex = 6;
			// 
			// label9
			// 
			this.label9.AutoSize = true;
			this.label9.Location = new System.Drawing.Point(16, 325);
			this.label9.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
			this.label9.Name = "label9";
			this.label9.Size = new System.Drawing.Size(62, 16);
			this.label9.TabIndex = 8;
			this.label9.Text = "Directory";
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(368, 574);
			this.Controls.Add(this.label9);
			this.Controls.Add(this.label8);
			this.Controls.Add(this.txtDirectory);
			this.Controls.Add(this.txtMethod);
			this.Controls.Add(this.label7);
			this.Controls.Add(this.txtSettings);
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
			this.Font = new System.Drawing.Font("Microsoft Sans Serif", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(204)));
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
			this.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
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
		private System.Windows.Forms.TextBox txtSettings;
		private System.Windows.Forms.Label label7;
		private System.Windows.Forms.TextBox txtMethod;
		private System.Windows.Forms.Label label8;
		private System.Windows.Forms.TextBox txtDirectory;
		private System.Windows.Forms.Label label9;
	}
}

