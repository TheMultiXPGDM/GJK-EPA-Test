export function negate (p)
{
	return {
		x: -p.x,
		y: -p.y
	};
}

export function sub (a,b)
{
	return {
		x: a.x-b.x,
		y: a.y-b.y
	};
}

export function add (a,b)
{
	return {
		x: a.x+b.x,
		y: a.y+b.y
	};
}

export function length (p)
{
	return Math.sqrt(dot(p,p));
}

export function normalize (p)
{
	let id = 1.0/length(p);
	return {
		x: p.x * id,
		y: p.y * id
	};
}

export function dot (a,b)
{
	return a.x * b.x + a.y * b.y;
}

export function tripleproduct (a,b,c)
{
	let z = a.x * b.y - a.y * b.x;
	return {x: -c.y * z, y: c.x * z};
}

export function scale (p,sx,sy)
{
	p.x *= sx;
	p.y *= (sy || sx);
	return p;
}