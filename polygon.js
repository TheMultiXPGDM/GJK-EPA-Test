function shuffle (array)
{ 
	for (let i = array.length - 1; i > 0; i--) { 
		const j = Math.floor(Math.random() * (i + 1)); 
		[array[i], array[j]] = [array[j], array[i]]; 
	} 
	return array;
}

export function randomConvexPolygon (N)
{
	var xco = [];
	var yco = [];
	
	for (var i = 0; i < N; i++)
	{
		xco.push(Math.random());
		yco.push(Math.random());
	}
	
	xco.sort();
	yco.sort();
	
	var xmin = xco[0],
	xmax = xco[N-1],
	ymin = yco[0],
	ymax = yco[N-1],
	
	xvec = [],
	yvec = [],
	
	lt = xmin,
	lb = xmin;
	
	for (var i = 1; i < N - 1; i++)
	{
		var x = xco[i];
		if (Math.random() < 0.5)
		{
			xvec.push(x - lt);
			lt = x;
		}
		else
		{
			xvec.push(lb - x);
			lb = x;
		}
	}
	
	xvec.push(xmax - lt);
	xvec.push(lb - xmax);
	
	var ll = ymin,
	lr = ymin;
	
	for (var i = 1; i < N - 1; i++)
	{
		var y = yco[i];
		if (Math.random() < 0.5)
		{
			yvec.push(y - ll);
			ll = y;
		}
		else
		{
			yvec.push(lr - y);
			lr = y;
		}
	}
	
	yvec.push(ymax - ll);
	yvec.push(lr - ymax);
	
	shuffle(yvec);
	
	var vecs = [];
	
	for (var i = 0; i < N; i++)
	{
		vecs[i] = {x:xvec[i],y:yvec[i]};
	}
	
	vecs.sort((u,v) => Math.atan2(u.y, u.x)-Math.atan2(v.y, v.x));
	
	var verts = [],
	sx = 0,
	sy = 0;
	xmin = 0;
	xmax = 0;
	ymin = 0;
	ymax = 0;
	
	var sa = 0,
	cx = 0,
	cy = 0;
	
	for (var i = 0; i < N; i++)
	{
		verts.push({x:sx,y:sy});
		xmin = Math.min(xmin,sx);
		xmax = Math.max(xmax,sx);
		ymin = Math.min(ymin,sy);
		ymax = Math.max(ymax,sy);
		sx += vecs[i].x;
		sy += vecs[i].y;
		
		var a = verts[i].x * sy - sx * verts[i].y;
		sa += a;
		cx += (verts[i].x + sx) * a;
		cy += (verts[i].y + sy) * a;
	}
	
	cx = cx/(sa*3);
	cy = cy/(sa*3);
	
	for (var i = 0; i < N; i++)
	{
		verts[i].x -= cx;
		verts[i].y -= cy;
	}
	
	return {
		pos: {
			x: 0,
			y: 0
		},
		verts:verts,
		box:{
			x: xmin-cx,
			y: ymin-cy,
			w: xmax-xmin,
			h: ymax-ymin
		}
	};
}