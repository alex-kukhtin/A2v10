﻿// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20240118-7967
// locale-es.js

"use strict";

(function () {

	window.$$locale = {
		$Locale: 'es-ES',
		$DateLocale: 'es-ES',
		$NumberLocale: 'es-ES',
		$Ok: 'OK',
		$Cancel: 'Cancelar',
		$Close: 'Cerrar',
		$Apply: 'Aplicar',
		$Back: 'Atrás',
		$Next: 'Siguiente',
		$Finish: 'Finalizar',
		$Tasks: 'Tareas',
		$Quit: 'Salir',
		$Save: 'Guardar',
		$NotSave: 'No guardar',
		$Refresh: 'Refrescar',
		$Confirm: 'Confirmar',
		$Error: 'Error',
		$Message: 'Mensaje',
		$Help: 'Ayuda',
		$ConfirmClose: 'Confirmación de cierre',
		$MakeValidFirst: 'Corregir errores primero',
		$ElementWasChanged: 'El elemento ha sido modificado. ¿Desea guardar los cambios?',
		$Profiling: 'Perfiles',
		$DataModel: 'Modelo de datos',
		$Admin: 'administrador',
		$Today: 'Hoy',
		$Week: 'Una semana',
		$Month: 'Mes',
		$Yesterday: 'Ayer',
		$CreateLC: 'crear',
		$NoElements: 'no items',
		$PagerElements: 'items',
		$Of: 'of',
		$Register: 'Register',
		$ClickToDownloadPicture: 'Haga clic para descargar una imagen',
		$ClickToDownloadFile: 'Arrastre y suelte aquí el archivo que desea cargar o haga clic para seleccionarlo',
		$EnterPassword: 'Introduzca la contraseña',
		$MatchError: 'La contraseña y la confirmación no coinciden',
		$PasswordLength: 'La contraseña debe tener al menos 6 caracteres',
		$PasswordAgain: 'Confirmar',
		$InvalidOldPassword: 'La contraseña antigua es incorrecta',
		$ChangePasswordNotAllowed: 'El cambio de contraseña no está permitido',
		$ChangePasswordSuccess: 'La contraseña se ha cambiado correctamente',
		$ChangePassword: 'Cambiar contraseña',
		$Last7Days: 'Últimos 7 días',
		$Last30Days: 'Últimos 30 días',
		$MonthToDate: 'Desde principios de mes',
		$PrevMonth: 'Mes anterior',
		$CurrMonth: 'Mes actual',
		$QuartToDate: 'Desde el inicio del trimestre',
		$PrevQuart: 'Trimestre anterior',
		$CurrQuart: 'Trimestre actual',
		$YearToDate: 'Desde principios de año',
		$CurrYear: 'Año actual',
		$PrevYear: 'Año anterior',
		$AllPeriodData: 'Para todos los tiempos',
		$CustomPeriod: 'Arbitrario',
		$Hours: 'Horas',
		$Minutes: 'Minutos',
		$License: 'licencia',
		$HomePage: 'página de inicio',
		$CreatedOpenSource: 'Creado con software de código abierto',
		$Unknown: 'No especificado',
		$ChooseFile: 'Elige un archivo',
		$AccessDenied: '¡Acceso al sistema denegado!',
		$PermissionDenied: '¡Acceso denegado!',
		$FileTooLarge: 'El archivo es demasiado grande. El tamaño del archivo no debe exceder {0} KB',
		$DesktopNotSupported: 'Esta operación no es compatible con la versión de escritorio',
		$Settings:'Configuración',
		$Feedback: 'Feedback',
		$PreviewIsUnavailable: 'Preview is unavailable for this file',
		$ShowSpecProps: 'Show special properties'
	};

	if (window.d3) {
		d3.formatDefaultLocale({
			decimal: ",",
			thousands: "\xa0",
			grouping: [3],
			currency: ["\u20B4", ""]
		});

		d3.timeFormatDefaultLocale({
			"dateTime": "%A, %e %B %Y р. %X",
			"date": "%d.%m.%Y",
			"time": "%H:%M:%S",
			"periods": ["AM", "PM"],
			"days": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
			"shortDays": ["do","lu","ma","mi","ju","vi","sa"],
			"months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			"shortMonths": ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
		});
	}
})();