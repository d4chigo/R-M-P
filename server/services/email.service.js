const nodemailer = require("nodemailer");
const crypto = require("crypto");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Solo inicializar si hay configuración SMTP
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: process.env.SMTP_PORT || 587,
          secure: false, // true para 465, false para otros puertos
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        console.log("✅ Servicio de email configurado correctamente");
      } catch (error) {
        console.warn("⚠️ Error configurando servicio de email:", error.message);
        this.transporter = null;
      }
    } else {
      console.warn("⚠️ Variables SMTP no configuradas - Email deshabilitado");
      this.transporter = null;
    }
  }

  // Generar contraseña temporal segura
  generateTemporaryPassword(length = 12) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Asegurar que tenga al menos una minúscula, una mayúscula, un número y un símbolo
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    // Completar el resto de la contraseña
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Mezclar los caracteres
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  // Plantilla HTML para email de nueva contraseña
  getNewPasswordTemplate(userName, tempPassword, isReset = false) {
    const title = isReset
      ? "Restablecimiento de Contraseña"
      : "Credenciales de Acceso";
    const message = isReset
      ? "Se ha restablecido su contraseña como solicitó."
      : "Se ha creado su cuenta en el sistema RMP.";

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - RMP</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2563eb;
                margin: 0;
                font-size: 28px;
            }
            .credentials {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .password {
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
                color: #1e40af;
                background: white;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #cbd5e1;
                letter-spacing: 2px;
            }
            .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
            }
            .warning-icon {
                color: #d97706;
                font-weight: bold;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚛 RMP - Route Management Platform</h1>
                <p>${title}</p>
            </div>

            <p>Estimado/a <strong>${userName}</strong>,</p>

            <p>${message}</p>

            <div class="credentials">
                <h3>Sus credenciales de acceso:</h3>
                <p><strong>Contraseña:</strong></p>
                <div class="password">${tempPassword}</div>
            </div>

            <div class="warning">
                <p><span class="warning-icon">⚠️</span> <strong>Importante:</strong></p>
                <ul>
                    <li>Por seguridad, <strong>cambie esta contraseña</strong> después del primer inicio de sesión</li>
                    <li>No comparta estas credenciales con nadie</li>
                    <li>Este email contiene información confidencial</li>
                </ul>
            </div>

            <p>Puede acceder al sistema usando su email y la contraseña proporcionada.</p>

            <div class="footer">
                <p>Este es un email automático, por favor no responda a este mensaje.</p>
                <p>Si tiene problemas para acceder, contacte al administrador del sistema.</p>
                <p><strong>RMP - Route Management Platform</strong></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Enviar email con nueva contraseña
  async sendNewPassword(email, userName, tempPassword, isReset = false) {
    try {
      console.log('[EMAIL] Intentando enviar correo a:', email);
      if (!this.transporter) {
        console.warn("⚠️ Email no configurado - Contraseña temporal generada pero no enviada");
        return {
          success: false,
          message: "Email no configurado. Contraseña temporal generada pero no enviada.",
          temporaryPassword: tempPassword,
        };
      }

      const subject = isReset ? "RMP - Contraseña Restablecida" : "RMP - Credenciales de Acceso";
      const htmlContent = this.getNewPasswordTemplate(userName, tempPassword, isReset);
      const mailOptions = {
        from: {
          name: "RMP - Route Management Platform",
          address: process.env.SMTP_USER || "noreply@rmp.com",
        },
        to: email,
        subject: subject,
        html: htmlContent,
        text: `
${isReset ? "Restablecimiento de Contraseña" : "Credenciales de Acceso"} - RMP

Estimado/a ${userName},

${isReset ? "Se ha restablecido su contraseña como solicitó." : "Se ha creado su cuenta en el sistema RMP."}

Su nueva contraseña es: ${tempPassword}

IMPORTANTE:
- Por seguridad, cambie esta contraseña después del primer inicio de sesión
- No comparta estas credenciales con nadie
- Este email contiene información confidencial

Puede acceder al sistema usando su email y la contraseña proporcionada.

Este es un email automático, por favor no responda a este mensaje.
Si tiene problemas para acceder, contacte al administrador del sistema.

RMP - Route Management Platform
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email enviado exitosamente:", {
        messageId: result.messageId,
        to: email,
        subject: subject,
      });
      return {
        success: true,
        messageId: result.messageId,
        message: "Email enviado exitosamente",
      };
    } catch (error) {
      console.error("❌ Error al enviar email:", error);
      return {
        success: false,
        message: "Error al enviar el correo electrónico",
        temporaryPassword: tempPassword,
      };
    }
  }

  // Verificar configuración del servicio de email
  async verifyConnection() {
    try {
      if (!this.transporter) {
        return {
          success: false,
          message: "Transportador no inicializado",
        };
      }

      await this.transporter.verify();

      return {
        success: true,
        message: "Conexión SMTP verificada exitosamente",
      };
    } catch (error) {
      console.error("Error verificando conexión SMTP:", error);
      return {
        success: false,
        message: "Error en conexión SMTP: " + error.message,
      };
    }
  }

  // Método para testing sin envío real
  async sendTestEmail(email, userName) {
    const tempPassword = this.generateTemporaryPassword();

    console.log("🧪 EMAIL DE PRUEBA - NO ENVIADO:");
    console.log("Para:", email);
    console.log("Usuario:", userName);
    return {
      success: true,
      message: "Email de prueba generado (no enviado)",
      temporaryPassword: tempPassword,
    };
  }

  // Enviar email de restablecimiento de contraseña
  async sendPasswordResetEmail(to, nombre, resetUrl) {
    const html = `
    <p>Hola ${nombre || ""},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace para crear una nueva contraseña (válido por 1 hora):</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Si no solicitaste esto, ignora este correo.</p>
    `;
    return this.transporter.sendMail({
      from: `"Soporte RMP" <${process.env.SMTP_USER}>`,
      to,
      subject: "Recupera tu contraseña",
      html
    });
  }
}

module.exports = new EmailService();
