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
		get width() { return v('width') },
		get height() { return v('height') }
	},
	
	get iterations() { return v('iterations') }
}

const step = {
	r: 0,
	c: 0,
	
	recalculateStep() {
		this.r = settings.window.real.size / settings.resolution.width;
		this.c = settings.window.complex.size / settings.resolution.height;
		
		($('step1') as HTMLTableCellElement).innerHTML = this.r;
		($('step2') as HTMLTableCellElement).innerHTML = this.c;
	}
}

const butt = $('submit') as HTMLButtonElement;
const canvas = $('plot') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');



function plot() {
	const img = ctx.createImageData(settings.resolution.width, settings.resolution.height);
	
	for (let x = 0; x < settings.resolution.width; x++) {
		for (let y = 0; y < settings.resolution.height; y++) {
			setPixel(img, x, y, getColor(calculateMandelbrot(x * step.r, y * step.c)));
		}
	}
	
	ctx.putImageData(img, 0, 0);
}

function setPixel(img: ImageData, x: number, y: number, c: [number, number, number]) {
	const index = (y * img.width + x) * 4; //reduce coordinates to array
	img.data[index+0] = c[0]; //r
	img.data[index+1] = c[1]; //g
	img.data[index+2] = c[2]; //b
	img.data[index+3] = 255; //a
}

function getColor(value: number): [number, number, number] {
	const val = Math.min(255, value);
	return [val, val, val];
}

function calculateMandelbrot(r: number, c: number): number {
	//NOW implement
}



butt.onclick = plot;

$('real1').onchange = $('real2').onchange =
	$('complex1').onchange = $('complex2').onchange =
	$('width').onchange = $('height').onchange =
	step.recalculateStep;

step.recalculateStep();
plot();
