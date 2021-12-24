

async function startWorkflow() {
	const resp = await fetch('/data/invoke', {
		method: 'post',
		body: JSON.stringify({
			cmd: 'startWorkflow',
			baseUrl: '/_page/workflow/index/0',
			data: {
				Id: 220
			}
		})
	});
}

async function resumeWorkflow() {
	const resp = await fetch('/data/invoke', {
		method: 'post',
		body: JSON.stringify({
			cmd: 'resumeWorkflow',
			baseUrl: '/_page/workflow/index/0',
			data: {
				Id: 625
			}
		})
	});
}

document.getElementById('start-workflow').addEventListener('click', startWorkflow);
document.getElementById('resume-workflow').addEventListener('click', resumeWorkflow);
