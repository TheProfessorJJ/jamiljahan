/**
* Copyright 2020 QantumThemes by Igor Nardo - All Rights Reserved
*/
jQuery.storedPeaks = [];

function qtWaveformDebug(m){
	if( jQuery('#qtmusicplayer').data('debug') ){
		// console.log(infor);
		var c = jQuery("#qtmPlayerDebugger");
		if(c.length > 0){
			c.append(m+'<br>');
		}
	}
}

/**
 * Retrieves audio from an external source, the initializes the drawing function
 * @param {String} url the url of the audio we'd like to fetch
 */
const drawAudio = url => {

	if(0 === jQuery('#qtKenthaPlayerWaveform').length ) return; // do nothing if 

	jQuery('#qtKenthaPlayerWaveform canvas').remove();
	jQuery('#qtKenthaPlayerWaveform').append('<canvas id="qtwaveformOriginal"></canvas><canvas id="qtwaveformClone"></canvas>');
	jQuery.qtmplayerCanvas = jQuery('#qtKenthaPlayerWaveform #qtwaveformOriginal');
	jQuery.qtmplayerCanvasClone = jQuery('#qtKenthaPlayerWaveform #qtwaveformClone');
	jQuery.qtmplayerCanvasCloneColor = jQuery('#qtKenthaPlayerWaveform').data('color'); // not in use
	if( undefined === jQuery.storedPeaks[url] ){
		var storedSongPeaks = false;
		var ajaxPeaksUrl = jQuery('#qtmusicplayer').data('siteurl'); // ajax_var.url;
		jQuery.ajax({
			type: "get",
			url: ajaxPeaksUrl,
			data: {
				'kentha_spectrum_url' : url,
			},
			success: function( response ){
				qtWaveformDebug('Waveform cache response success');
				var valid = 0;
				if(  'undefined' !== typeof(response) ){
					if(response !== 'error'){
						var peaks = jQuery.parseJSON(response);
						if(typeof(peaks) == 'object') {
							valid = 1;
						}
					}
				}
				if( 1 === valid ){
					qtWaveformDebug('Use DB peaks');
					var peaks = jQuery.parseJSON(response );
					jQuery.storedPeaks[url] = peaks;
					draw(url, peaks, false);
				} else {
					qtWaveformDebug('Calculate peaks new');
					window.AudioContext = window.AudioContext || window.webkitAudioContext;
					const audioContext = new AudioContext();
					fetch(url)
					.then(response => response.arrayBuffer())
					.then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
					.then(audioBuffer => draw(url,normalizeData(filterData(audioBuffer)),true)); // third parameter: store the data?
				}
				return true;
			}, fail: function(e){
				qtWaveformDebug( e );
				qtWaveformDebug('Ajax FAIL');
			}
		});
	} else {
		draw(url, jQuery.storedPeaks[url], false);
		return true;
	}
};

/**
 * Filters the AudioBuffer retrieved from an external source
 * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
 * @returns {Array} an array of floating point numbers
 */
const filterData = audioBuffer => {
	const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
	const samples = 500; // Number of samples we want to have in our final data set
	const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
	const filteredData = [];
	for (let i = 0; i < samples; i++) {
		let blockStart = blockSize * i; // the location of the first sample in the block
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
		}
		filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
	}
	return filteredData;
};

/**
 * Normalizes the audio data to make a cleaner illustration 
 * @param {Array} filteredData the data from filterData()
 * @returns {Array} an normalized array of floating point numbers
 */
const normalizeData = filteredData => {
	const multiplier = Math.pow(Math.max(...filteredData), -1);
	let normalized = filteredData.map(n => n * multiplier);
	return normalized;
}



/**
 * Draws the audio file into a canvas element.
 * @param {Array} normalizedData The filtered array returned from filterData()
 * @returns {Array} a normalized array of data 
 */
const draw = ( url, normalizedData, storeData) => {
	const canvas = jQuery.qtmplayerCanvas[0];//document.querySelector("canvas");
	
	const dpr = window.devicePixelRatio || 1;
	const gap = 1;
	const padding = 2;
	canvas.width = canvas.offsetWidth * dpr;
	canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
	const ctx = canvas.getContext("2d");
	ctx.scale(dpr, -dpr);
	ctx.translate(0, - canvas.offsetHeight - padding- padding  ); // set Y = 0 to be in the middle of the canvas

	// draw the line segments
	const width = Math.round( canvas.offsetWidth / normalizedData.length );
	jQuery.storedPeaks[url] = normalizedData;// Save the peaks associated with the URL to avoid reloading the same file again

	qtWaveformDebug('Store data:'+storeData)
	if(true == storeData){

		jQuery.ajax({
			type: "post",
			url: ajax_var.url,
			data: {
				'action': 'qtmplayer-store-peaks',
				'nonce': ajax_var.nonce,
				'url': url,
				'peaks': normalizedData
			},
			success: function( response ){
				qtWaveformDebug('Data stored: '+response);
				return true;
			},
			fail: function(e){
				qtWaveformDebug('Data not stored: '+response);
				return false;
			}
		});
	}

	const peakSpacing = 4;
	ctx.beginPath();
	ctx.moveTo( 0, 0 );
	let x;
	// Draw the upper path.
	for ( let i = 0; i < normalizedData.length; i++ ) {
		let x = Math.round(width * i);
		let height = normalizedData[i] * canvas.offsetHeight - padding;
		ctx.moveTo( x, 0 );
		ctx.lineTo( x, height );
		ctx.lineTo( Math.round(width - gap + x)  , height);
		ctx.lineTo( Math.round(width - gap + x), 0);
		ctx.lineTo( width + x , 0);
	}

	// Original full
	ctx.moveTo( 0, 0 );
	ctx.strokeStyle = '#FFFFFF';
	ctx.fillStyle="#FFFFFF";
	ctx.fill();


	// ===============
	// The clone
	// ===============
	const canvasClone = jQuery.qtmplayerCanvasClone[0];//document.querySelector("canvas");
	canvasClone.width = canvasClone.offsetWidth * dpr;
	canvasClone.height = (canvasClone.offsetHeight + padding * 2) * dpr;
	const ctxClone = canvasClone.getContext("2d");
	ctxClone.scale(dpr, -dpr);
	ctxClone.translate(0, - canvasClone.offsetHeight - padding - padding  ); // set Y = 0 to be in the middle of the canvas
	ctxClone.beginPath();
	ctxClone.moveTo( 0, 0 );
	// Draw the upper path.
	for ( let i = 0; i < normalizedData.length; i++ ) {
		let x = width * i;
		let height = normalizedData[i] * canvas.offsetHeight - padding;
		ctxClone.moveTo( x, 0 );
		ctxClone.lineTo( x, height );
		ctxClone.lineTo( Math.round(width - gap + x)  , height);
		ctxClone.lineTo( Math.round(width - gap + x), 0);
		ctxClone.lineTo( width + x , 0);
	}
	// Clone for tracking
	ctxClone.moveTo( 0, 0 );
	ctxClone.strokeStyle = jQuery.qtmplayerCanvasCloneColor;
	ctxClone.fillStyle=jQuery.qtmplayerCanvasCloneColor;
	ctxClone.fill();


};
