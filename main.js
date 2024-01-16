import { randomConvexPolygon } from "./polygon.js";
import { GJK } from "./gjk.js";

function AABBCollision (a,b)
{
	return ((a.x < b.x+b.w && b.x < a.x+a.w) && (a.y < b.y+b.h && b.y < a.y+a.h));
}

function drawPolygon (ctx,poly,scale,xoffset,yoffset,bigVerts,vertScale)
{
	if (poly.verts.length == 0)
		return;
	ctx.beginPath();
	ctx.moveTo(
		(poly.verts[0].x + poly.pos.x) * scale + xoffset,
		(poly.verts[0].y + poly.pos.y) * scale + yoffset
	);
	for (var i = 1; i < poly.verts.length; i++)
	{
		ctx.lineTo(
			(poly.verts[i].x + poly.pos.x) * scale + xoffset,
			(poly.verts[i].y + poly.pos.y) * scale + yoffset
		);
	}
	ctx.closePath();
	ctx.stroke();
	if (bigVerts)
	{
		for (var i = 0; i < poly.verts.length; i++)
		{
			ctx.beginPath();
			ctx.arc(
				(poly.verts[i].x + poly.pos.x) * scale + xoffset,
				(poly.verts[i].y + poly.pos.y) * scale + yoffset,
				(i+1) / poly.verts.length * vertScale,
				0,Math.PI*2,false
			);
			ctx.closePath();
			ctx.stroke();
		}
	}
}

function drawMinkowski (ctx,A,B,scale,xoffset,yoffset)
{
	for (var i = 0; i < A.verts.length; i++)
		for (var j = 0; j < B.verts.length; j++)
		{
			ctx.beginPath();
			ctx.arc(
				((A.verts[i].x+A.pos.x)-(B.verts[j].x+B.pos.x)) * scale + xoffset,
				((A.verts[i].y+A.pos.y)-(B.verts[j].y+B.pos.y)) * scale + yoffset,
				2,
				0,
				Math.PI*2,
				false
				);
			ctx.closePath();
			ctx.fill();
		}
}

function drawPolyBox (ctx,poly,scale,xoffset,yoffset)
{
	ctx.strokeRect(xoffset+poly.box.x*scale,yoffset+poly.box.y*scale,poly.box.w*scale,poly.box.h*scale);
}

function drawVector (ctx,vec,scale,xoffset,yoffset)
{
	ctx.beginPath();
	ctx.moveTo(xoffset,yoffset);
	ctx.lineTo(xoffset+vec.x*scale,yoffset+vec.y*scale);
	ctx.closePath();
	ctx.stroke();
}

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth = 1;

var polyA = randomConvexPolygon(8);
var polyB = randomConvexPolygon(8);
polyB.pos.x = 1;
polyB.pos.y = .5;

const mousePosText = document.getElementById('mouse-pos');
let mousePos = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
	var rect = canvas.getBoundingClientRect();
	mousePos = {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
});

const scale = 200;

const halfWidth = canvas.width/2;
const halfHeight = canvas.height/2;

function randomize ()
{
	var tx = polyB.pos.x, ty = polyB.pos.y;
	polyA = randomConvexPolygon(document.getElementById("vertexcountA").value || 8);
	polyB = randomConvexPolygon(document.getElementById("vertexcountB").value || 8);
	polyB.pos.x = tx;
	polyB.pos.y = ty;
}

document.getElementById("randomize").addEventListener('click', randomize);

function Step()
{
	document.getElementById('Ax').disabled = document.getElementById("activeA").checked;
	document.getElementById('Ay').disabled = document.getElementById("activeA").checked;
	document.getElementById('Bx').disabled = document.getElementById("activeB").checked;
	document.getElementById('By').disabled = document.getElementById("activeB").checked;
	
	if (!document.getElementById("activeA").checked)
	{
		var fx = parseFloat(document.getElementById("Ax").value);
		var fy = parseFloat(document.getElementById("Ay").value);
		polyA.pos.x = (isNaN(fx)) ? polyA.pos.x : fx;
		polyA.pos.y = (isNaN(fy)) ? polyA.pos.y : fy;
	}
	if (!document.getElementById("activeB").checked)
	{
		var fx = parseFloat(document.getElementById("Bx").value);
		var fy = parseFloat(document.getElementById("By").value);
		polyB.pos.x = (isNaN(fx)) ? polyB.pos.x : fx;
		polyB.pos.y = (isNaN(fy)) ? polyB.pos.y : fy;
	}
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	if (document.getElementById("activeA").checked)
	{
		polyA.pos.x = (mousePos.x - halfWidth) / scale;
		polyA.pos.y = (mousePos.y - halfHeight) / scale;
		document.getElementById("Ax").value = polyA.pos.x;
		document.getElementById("Ay").value = polyA.pos.y;
	}
	if (document.getElementById("activeB").checked)
	{
		polyB.pos.x = (mousePos.x - halfWidth) / scale;
		polyB.pos.y = (mousePos.y - halfHeight) / scale;
		document.getElementById("Bx").value = polyB.pos.x;
		document.getElementById("By").value = polyB.pos.y;
	}
	
	let collision = GJK(polyA,polyB);
	
	if (document.getElementById("debug").checked)
	{
		ctx.beginPath();
		ctx.arc(halfWidth,halfHeight,1,0,Math.PI*2.0,false);
		ctx.closePath();
		ctx.stroke();
	}
	
	if (collision.intersects)
	{
		if (document.getElementById("debug").checked)
		{
			var polytope = {
				pos: {
					x: 0,
					y: 0
				},
				verts: collision.epa.polytope
			};
			
			ctx.strokeStyle = "#F48";
			drawPolygon(ctx,polytope,scale,halfWidth,halfHeight);
			ctx.strokeStyle = "#4AF";
			for (var i = 0; i < collision.dirs.length; i++)
				drawVector(ctx,collision.dirs[i],scale*0.2,halfWidth,halfHeight);
			ctx.strokeStyle = "#A4F";
			drawVector(ctx,collision.epa.penetration,scale,halfWidth,halfHeight);
		}
		if (document.getElementById("collide").checked)
		{
			if (document.getElementById("activeA").checked)
			{
				polyB.pos.x += collision.epa.penetration.x;
				polyB.pos.y += collision.epa.penetration.y;
				document.getElementById("Bx").value = polyB.pos.x;
				document.getElementById("By").value = polyB.pos.y;
			}
			if (document.getElementById("activeB").checked)
			{
				polyA.pos.x -= collision.epa.penetration.x;
				polyA.pos.y -= collision.epa.penetration.y;
				document.getElementById("Ax").value = polyA.pos.x;
				document.getElementById("Ay").value = polyA.pos.y;
			}
		}
	}
	if (document.getElementById("debug").checked)
	{
		var simplex = {
			pos: {
				x: 0,
				y: 0
			},
			verts: collision.simplex
		};
		ctx.strokeStyle = "#8F4";
			drawPolygon(ctx,simplex,scale,halfWidth,halfHeight,true,5);
	}
	ctx.strokeStyle = "#FFF";
	
	drawPolygon(ctx,polyA,scale,halfWidth,halfHeight,false);
	drawPolygon(ctx,polyB,scale,halfWidth,halfHeight,false);
	
	
	
}

function onTimerTick() {
    Step();
}

setInterval(onTimerTick, 15);