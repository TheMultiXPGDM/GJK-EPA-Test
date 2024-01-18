import * as Vector from "./vector.js"

const eps = 1e-5

function farthest (poly,d)
{
	var maxdist = 0;
	var index = 0;
	for (var i = 0; i < poly.verts.length; i++)
	{
		var dist = Vector.dot(poly.verts[i],d);
		if (dist > maxdist)
		{
			maxdist = dist;
			index = i;
		}
	}
	return poly.verts[index];
}

function support (A,B,d)
{
	var a = farthest(A,d);
	var b = farthest(B,Vector.negate(d));
	return Vector.sub(Vector.add(a,A.pos),Vector.add(b,B.pos));
}

function faketriple (a,b)
{
	var p = {x:-a.y, y:a.x};
	if (Vector.dot(p,b) < 0)
		return Vector.scale(p,-1);
	return p;
}

export function GJK (A,B)
{
	var d = (A.pos.x == B.pos.x && A.pos.y == B.pos.y) ? {x: 1, y: 0} : Vector.normalize(Vector.sub(B.pos,A.pos));
	var a, b, c;
	a = support(A,B,d);
	if (Vector.dot(a,d) < 0)
		return {
			intersects: false,
			simplex: [a],
			epa: null
		};
	
	d = Vector.negate(a);
	b = support(A,B,d);
	var ab = Vector.sub(b,a);
	d = Vector.normalize(faketriple(ab,d));
	
	var ac, bc, co, acp, bcp;
	
	for (var i = 0; i < 30; i++)
	{
		c = support(A,B,d);
		if (Vector.dot(c,d) < 0)
			return {
				intersects: false,
				simplex: (c) ? [a,b,c] : [a,b],
				epa: null
			};
		
		ac = Vector.sub(a,c);
		bc = Vector.sub(b,c);
		co = Vector.negate(c);
		
		bcp = Vector.normalize(Vector.negate(faketriple(bc,ac)));
		acp = Vector.normalize(Vector.negate(faketriple(ac,bc)));
		
		if (Vector.dot(acp,co) > 0)
		{
			b = c;
			d = acp;
			continue;
		}
		if (Vector.dot(bcp,co) > 0)
		{
			a = b;
			b = c;
			d = bcp;
			continue;
		}
		
		return {
			intersects: true,
			simplex: [a,b,c],
			dirs: [d,acp,bcp],
			epa: EPA(A,B,[a,b,c])
		};
	}
	
	return {
		intersects: false,
		simplex: [a,b,c]
	};
}

export function EPA (A,B,polytope)
{
	var mindist = Infinity;
	var minindex;
	var minnormal;
	
	var polysize = polytope.length;
	
	for (var k = 0; k < 30; k++)
	{
		if (mindist < Infinity) break;
		
		var edge, vi, vj, normal, dist, p;
		
		for (var i = 0, j = 1; i < polysize - 1; i++, j++)
		{
			vi = polytope[i];
			vj = polytope[j];
			edge = Vector.sub(vi,vj);
			normal = Vector.normalize({x: edge.y, y: -edge.x});
			dist = Vector.dot(normal,vi);
			if (dist < 0)
			{
				dist *= -1;
				normal = Vector.scale(normal,-1);
			}
			if (dist < mindist)
			{
				mindist = dist;
				minnormal = normal;
				minindex = j;
			}
		}
		
		i = polysize - 1; j = 0;
		vi = polytope[i];
		vj = polytope[j];
		edge = Vector.sub(vi,vj);
		normal = Vector.normalize({x: edge.y, y: -edge.x});
		dist = Vector.dot(normal,vi);
		if (dist < 0)
		{
			dist *= -1;
			normal = Vector.scale(normal,-1);
		}
		if (dist < mindist)
		{
			mindist = dist;
			minnormal = normal;
			minindex = j;
		}
		
		p = support(A,B,minnormal);
		dist = Vector.dot(minnormal,p);
		if (Math.abs(dist - mindist) > eps)
		{
			mindist = Infinity;
			for (var i = polysize - 1; i >= minindex; i--)
				polytope[i + 1] = polytope[i];
			polytope[minindex] = p;
			polysize++;
		}
	}
	minnormal = Vector.scale(minnormal, mindist+eps);
	return {
		penetration: minnormal,
		polytope: polytope
	};
}
