const { ipcRenderer } = require('electron');
const { writeFile } = require('fs');

function openCapture(source_id) {
  // let res = ipcRenderer.sendSync('startCapture', source_id)
  // console.log(res)

}

window.addEventListener('DOMContentLoaded', () => {
	let mediaRecorder = {},timer = {},recordedChunks = {},sname = {};
	async function startCapture(source_id) {
      	let h = 0,m = 0, s = 0;
		const constraints = {
			audio: {
				mandatory: {
					chromeMediaSource: 'desktop'
				}
			},
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: source_id.replaceAll('_',':')
				}
			}
		};

		// Create a Stream
		let fstream = new MediaStream();
		let streams = [];
		streams.push(await navigator.mediaDevices.getUserMedia({ audio: true }));
		streams.push(await navigator.mediaDevices.getUserMedia(constraints));
		for(stream of streams){
			stream.getTracks().forEach(track => fstream.addTrack(track));
		}
		// let castream = new MediaStream([vstream.getAudioTracks(),astream.getAudioTracks()]);
		// let cavstream = new MediaStream([vstream.getVideoTracks(),castream.getAudioTracks()]);
		// Create the Media Recorder
		mediaRecorder[source_id] = new MediaRecorder(fstream);
		mediaRecorder[source_id].start();
		timer.source_id = setInterval(()=>{
			s +=1;
			if(s == 60) { s = 0; m +=1;}
			if(m == 60){ m = 0; h += 1; }
			
			document.getElementById(`${source_id}rlength`).textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
		},1000);

		// Register Event Handlers
		recordedChunks[source_id] = [];
		mediaRecorder[source_id].ondataavailable = (e) =>{recordedChunks[source_id].push(e.data)};
		mediaRecorder[source_id].onstop = async (e) =>{
			clearInterval(timer[source_id]);
			let blob = new Blob(recordedChunks[source_id]);
			let buffer = Buffer.from(await blob.arrayBuffer());
			if (filePath = true) {writeFile(`Capture_${sname[source_id]}_${Date.now()}.mp4`, buffer,()=>{console.log('recorded')})}
		};
	}

	async function showScreens () {
		const desktopCapturer = {
			getSources: await ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES', {
				types: ["screen", "window"],
				fetchWindowIcons:true,
			})
		}
		let html = '';
		sources = await desktopCapturer.getSources;
		// console.log(sources)
		for (let i = 0; i < sources.length; ++i) {
			html += `
			<div class="w-full relative" style="
			background: #233541;
			border: 5px solid #233541;
			box-shadow: inset 0px 0px 0px #152E44,
			inset 0px 0px 0px #396387,
			4px 4px 9px #070c10,
			-4px -4px 9px #627b8b;border-radius: 10px;overflow:hidden;">
				<span class="w-full h-full absolute flex justify-center items-center" style="z-index:9999;"  id="${sources[i].id.replaceAll(':','_')}recordBtn"></span>
				<video class="w-full" onmouseover="this.parentElement.firstElementChild.firstElementChild.hidden=false;" onmouseout="this.parentElement.firstElementChild.firstElementChild.hidden=true;"></video>
				<img src="" class="w-full">
				<span class="w-full flex border-t border-gray-600 items-center absolute bottom-0 p-4 bg-black bg-opacity-75 text-white">
				${(sources[i].appIcon ? `<img src="${sources[i].appIcon.toDataURL()}" style="width:32px; height:32px">` : `<img src="data:image/png;base64,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" style="width:auto; height:32px"/> `)}
				<span class="ml-4" style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${sources[i].name}</span>
				</span>
			</div>`;
			sname[sources[i].id.replaceAll(':','_')] = sources[i].name.slice(sources[i].name.lastIndexOf('-')+1);
			navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: sources[i].id
					}
				}
			}).then((stream) => handleStream(stream,i,sources[i].id.replaceAll(':','_')))
			.catch((error) => console.log(error))
		}
		document.querySelector('#screens').innerHTML = html;
  	}
  
	function handleStream (stream,i,id) {
		let video = document.querySelector('#screens').children[i].children[1]
		video.srcObject = stream
		video.onloadedmetadata = function(){
			video.play()
			
			let canvas = document.createElement('canvas');
			canvas.width = this.videoWidth;
			canvas.height = this.videoHeight;
			let ctx = canvas.getContext('2d');
			// Draw video on canvas
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			document.getElementById('screens').children[i].children[2].src = canvas.toDataURL();
			document.getElementById(id+'recordBtn').innerHTML = `
				<div class="flex items-center p-1 bg-gray-900 border border-transparent rounded-full" style="height:50px;width: 120px; -webkit-touch-callout : none;-webkit-user-select:none">
					<div class="flex items-center h-full">
						<div class="w-10 h-full border rounded-full cursor-pointer" style="padding: 0.2rem;" id="${id}startBtn">
							<div class="w-full h-full border border-transparent rounded-full bg-red-600"></div>
						</div>
						<h1 class="text-white text-md px-2">Capture</h1>
					</div>
				</div>
				<div class="hidden items-center p-1 bg-gray-900 border border-transparent rounded-full" style="height:50px;width: 125px; -webkit-touch-callout : none;-webkit-user-select:none">
					<div class="flex items-center h-full">
						<div class="flex w-10 h-full justify-center items-center border rounded-full cursor-pointer" id="${id}stopBtn">
							<div class="w-4 h-4 bg-red-600"></div>
						</div>
						<h1 class="text-white text-md px-2" id="${id}rlength">00:00:00</h1>
					</div>
				</div>`;
			document.getElementById(`${id}startBtn`).addEventListener('click',function(){
				startCapture(this.id.replace('startBtn',''));
				this.parentElement.parentElement.classList.replace('flex','hidden');
				document.getElementById(`${id}stopBtn`).parentElement.parentElement.classList.replace('hidden','flex');
			});
			
			document.getElementById(`${id}stopBtn`).addEventListener('click',function(){
				mediaRecorder[this.id.replace('stopBtn','')].stop();
				this.parentElement.parentElement.classList.replace('flex','hidden');
				document.getElementById(`${id}startBtn`).parentElement.parentElement.classList.replace('hidden','flex');
			});
			// Remove hidden video tag
			video.remove();
			try {stream.getTracks()[0].stop();} catch (e) {} 
		}
	
	}
	
	alertThem = (appendTo,title, summary, details, type, dismissible=true, autoDismiss=true) => {
		let iconMap = {
			info: {ic:"#016d9b",bg:"#b9eaff",d:"M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2V9H9v2zm0-6v2h2V5H9z"},
			success: {ic:"#037249",bg:"#aeffe1",d:"M11 0h1v3l3 7v8a2 2 0 0 1-2 2H5c-1.1 0-2.31-.84-2.7-1.88L0 12v-2a2 2 0 0 1 2-2h7V2a2 2 0 0 1 2-2zm6 10h3v10h-3V10z"},
			warning: {ic:"#959704",bg:"#fcfdb6",d:"M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"},
			danger: {ic:"#bb324e",bg:"#ffe2e2",d:"M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"},
			notification:{ic:"#016d9b",bg:"#b9eaff",d:"M4 8a6 6 0 0 1 4.03-5.67 2 2 0 1 1 3.95 0A6 6 0 0 1 16 8v6l3 2v1H1v-1l3-2V8zm8 10a2 2 0 1 1-4 0h4z"},
			times:{ic:"#bb324e",bg:"#ffe2e2",d:"M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83-1.41-1.41L10 8.59 7.17 5.76 5.76 7.17 8.59 10l-2.83 2.83 1.41 1.41L10 11.41l2.83 2.83 1.41-1.41L11.41 10z"}
		};
		let iconAdded = false;

		let alerth = '';
		let mi = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20px" fill="${iconMap[type].ic}"><path d="${iconMap[type].d}"></path></svg>`;
		let cb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20px" onclick="this.parentElement.parentElement.remove()" onmouseover="this.fill='#bb324e'" style="cursor: pointer;opacity: 0.5;"><path d="${iconMap.times.d}"></path></svg>`;
		let fm = 'display:flex;margin:0px;align-items:center;';
		let fg = 'flex-grow:1;';
		let am = `display:flex;flex-direction:column;border-radius:5px;background:${iconMap[type].bg};padding: 15px;min-width:300px;margin:5px;border:1px solid ${iconMap[type].ic}`;
		alerth = 
			`<div style="${am}" >
				${(title? `
					<h3 style="${fm}">
						${(iconAdded ? '' : mi)}
						<span style="${fg}${iconAdded ? '' : 'padding:0px 10px;'.replace(iconAdded = true,'')}">${title}</span>
						${(dismissible ? cb.replace(dismissible = false,'') : '')}
					</h3>`:''

					)}
				${(summary ? `
					<strong style="${fm};${(iconAdded ? 'margin-top:5px;' : '')}">
						${(iconAdded ? '' : mi)}
						<span style="${fg}${iconAdded ? '' : 'padding:0px 10px;'.replace(iconAdded = true,'')}">${summary}</span>
						${(dismissible ? cb.replace(dismissible = false,'') : '')}
					</strong>`:'')}
				${(details? `
					<p style="${fm}${(iconAdded ? 'margin-top:5px;' : '')}">
						${(iconAdded ? '' : mi)}
						<span style="${fg}${(iconAdded ? '' : 'padding:0px 10px;')}">${details}</span>
						${(dismissible ? cb : '')}
					</p>`:'')}
			</div>`;
		document.querySelector(appendTo).innerHTML += alerth;
	}
	function restartApp() {
		ipcRenderer.send('restart_app');
	}
	showScreens();

	ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version');
      document.getElementById('version').innerText = 'Version ' + arg.version;
    });
	// alertThem('#page_message','Test','','','success')
	// alertThem('#page_message','Info','','','info')
	// alertThem('#page_message','Warning','','','warning')
	// alertThem('#page_message','danger','','','danger')

	ipcRenderer.on('update_available', () => {
		ipcRenderer.removeAllListeners('update_available');
		alertThem('#page_message','Downloading','','A new update is available. Downloading now...','info')
	});
	ipcRenderer.on('update_downloaded', () => {
		ipcRenderer.removeAllListeners('update_downloaded');
		alertThem('#page_message','Downloaded','','Update Downloaded. It will be installed on restart. Restart now?<button class="px-2 py-1 bg-green-600 text-white rounded" onclick="restartApp()">Restart</button>','success')
	});
	document.getElementById("minBtn").addEventListener("click", async (e) => {
		await ipcRenderer.invoke('control_mmc_action', 'min');
	});

	// Maximize window
	document.getElementById("maxBtn").addEventListener("click", async (e) => {
		await ipcRenderer.invoke('control_mmc_action', 'max');
	});

	// Close app
	document.getElementById("closeBtn").addEventListener("click", async (e) => {
		await ipcRenderer.invoke('control_mmc_action', 'cls');
	});
})
