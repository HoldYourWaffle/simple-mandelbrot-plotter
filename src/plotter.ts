import Complex from 'complex.js'

const $ = (id: string) => document.getElementById(id); //can't shorten because browsers are weird
const v = (id: string) => parseInt(($(id) as HTMLInputElement).value);

type SetType = 'mandelbrot' | 'julia';

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

	juliaC: {
		get a() { return v('julia-c-a') },
		get b() { return v('julia-c-b') }
	},

	get power() { return v('power') },

	get iterations() { return v('iterations') },

	get setType(): SetType {
		return (document.querySelector('input[name="set"]:checked')! as HTMLInputElement).value as SetType
	}


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

	const func = settings.setType === 'mandelbrot' ? calculateMandelbrot : calculateJulia;

	for (let x = 0; x < settings.resolution.width; x++) {
		for (let y = 0; y < settings.resolution.height; y++) {
			setPixel(img, x, y, getColor(func(new Complex(settings.window.real.min + (x * step.r), settings.window.complex.min + (y * step.c)))));
		}
	}

	ctx.putImageData(img, 0, 0);

	butt.disabled = false;
	console.log('Done!');
}

function setPixel(img: ImageData, x: number, y: number, c: [number, number, number]) {
	const index = (y * img.width + x) * 4; //reduce coordinates to array
	img.data[index + 0] = c[0]; //r
	img.data[index + 1] = c[1]; //g
	img.data[index + 2] = c[2]; //b
	img.data[index + 3] = 255; //a
}

function getColor(value: number): [number, number, number] {
	const v = (1 - value) * 360;
	console.log(value);
	return HSLToRGB(v, 100, 50);
}



function HSLToRGB(h: number, s: number, l: number): [number, number, number] {
	// Must be fractions of 1
	s /= 100;
	l /= 100;

	let c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs((h / 60) % 2 - 1)),
		m = l - c / 2,
		r = 0,
		g = 0,
		b = 0;

	if (0 <= h && h < 60) {
		r = c; g = x; b = 0;
	} else if (60 <= h && h < 120) {
		r = x; g = c; b = 0;
	} else if (120 <= h && h < 180) {
		r = 0; g = c; b = x;
	} else if (180 <= h && h < 240) {
		r = 0; g = x; b = c;
	} else if (240 <= h && h < 300) {
		r = x; g = 0; b = c;
	} else if (300 <= h && h < 360) {
		r = c; g = 0; b = x;
	}
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	return [r, g, b];
}



function calculateMandelbrot(c: Complex): number {
	function iterate(z: Complex): Complex {
		return z.pow(new Complex(settings.power, 0)).add(c);
	}


	let i = 0;
	let z = new Complex(0, 0);

	while (i <= settings.iterations) {
		z = iterate(z);

		const d = Math.sqrt(z.re ** 2 + z.im ** 2);

		if (d > 2) {
			//return 1;
			break;
		} else {
			i++;
		}
	}

	return i / settings.iterations;
}


function calculateJulia(z: Complex): number {
	const c = new Complex(settings.juliaC.a, settings.juliaC.b);

	function iterate(z: Complex): Complex {
		return z.pow(new Complex(settings.power, 0)).add(c);
	}

	let i = 0;
	//let z = new Complex(0, 0);

	while (i <= settings.iterations) {
		z = iterate(z);

		const d = Math.sqrt(z.re ** 2 + z.im ** 2);

		if (d > 2) {
			break;
		} else {
			i++;
		}
	}

	return i / settings.iterations;
}



butt.onclick = plot;
$('clear')!.onclick = clear;

$('real1')!.onchange = $('real2')!.onchange =
	$('complex1')!.onchange = $('complex2')!.onchange =
	$('resw')!.onchange = $('resh')!.onchange =
	step.recalculateStep;

//plot();
