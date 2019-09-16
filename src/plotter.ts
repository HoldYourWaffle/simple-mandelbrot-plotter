import Complex from 'complex.js'

const $ = (id: string) => document.getElementById(id); //can't shorten because browsers are weird
const v = (id: string) => parseInt(($(id) as HTMLInputElement).value);

const settings = {
	window: {
		real: {
			get min() { return v('real1') },
			get max() { return v('real2') },
			get size() { return (this.max - this.min) }
		},
		
		complex: {
			get min() { return v('complex1') },
			get max() { return v('complex2') },
			get size() { return (this.max - this.min) }
		}
	},
	
	resolution: {
		get width() { return v('resw') },
		get height() { return v('resh') }
	},
	
	get iterations() { return v('iterations') }
}

const step = {
	r: 0,
	c: 0,
	
	recalculateStep() {
		this.r = settings.window.real.size / settings.resolution.width;
		this.c = settings.window.complex.size / settings.resolution.height;
		
		($('step1') as HTMLTableCellElement).innerHTML = this.r.toString();
		($('step2') as HTMLTableCellElement).innerHTML = this.c.toString();
	}
}

const butt = $('submit') as HTMLButtonElement;
const canvas = $('plot') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;



function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function plot() {
	console.log('Plotting...');
	butt.disabled = true;
	
	step.recalculateStep(); //FIXME why is this needed?
	clear();
	
	const img = ctx.createImageData(settings.resolution.width, settings.resolution.height);
	canvas.width = settings.resolution.width;
	canvas.height = settings.resolution.height;
	
	for (let x = 0; x < settings.resolution.width; x++) {
		for (let y = 0; y < settings.resolution.height; y++) {
			setPixel(img, x, y, getColor(calculateMandelbrot(new Complex(settings.window.real.min + (x * step.r), settings.window.complex.min + (y * step.c)))));
		}
	}
	
	ctx.putImageData(img, 0, 0);
	
	butt.disabled = false;
	console.log('Done!');
}

function setPixel(img: ImageData, x: number, y: number, c: [number, number, number]) {
	const index = (y * img.width + x) * 4; //reduce coordinates to array
	img.data[index+0] = c[0]; //r
	img.data[index+1] = c[1]; //g
	img.data[index+2] = c[2]; //b
	img.data[index+3] = 255; //a
}

function getColor(value: number): [number, number, number] {
	const v = (1-value) * 255;
	return [v, v, v];
}

function calculateMandelbrot(c: Complex): number {
	const d = Math.sqrt( Math.pow(c.re, 2) + Math.pow(c.im, 2) );
	const f = (z: number) => Math.pow(z, 2) + d;
	
	let z = 0, i = 0;
	
	while (i <= settings.iterations) {
		z = f(z);
		
		if (z > 2) {
			//break;
			return 1;
		} else {
			i++;
		}
	}
	
	//return i / settings.iterations;
	return 0;
}



butt.onclick = plot;
$('clear')!.onclick = clear;

$('real1')!.onchange = $('real2')!.onchange =
	$('complex1')!.onchange = $('complex2')!.onchange =
	$('resw')!.onchange = $('resh')!.onchange =
	step.recalculateStep;

plot();
