import{V,C as Q,W as tt,S as et,F as it,P as st,B as H,a as f,b as B,A as u,c as j,I as at,M as _,d as Y,e as W,f as E,L as rt,g as nt,D as ot,h as ht,N as b,i as F,j as lt}from"./three-CvlHKI96.js";const C=Math.PI*2;function d(T){const t=Math.sin(T*12.9898)*43758.5453;return t-Math.floor(t)}function Z(T=!1,t=128){const e=document.createElement("canvas");e.width=e.height=t;const s=e.getContext("2d"),i=s.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);T?(i.addColorStop(0,"rgba(29, 78, 216, 0.95)"),i.addColorStop(.22,"rgba(37, 99, 235, 0.70)"),i.addColorStop(.5,"rgba(59, 130, 246, 0.30)"),i.addColorStop(1,"rgba(37, 99, 235, 0)")):(i.addColorStop(0,"rgba(240,248,255,1)"),i.addColorStop(.18,"rgba(96,165,250,0.85)"),i.addColorStop(.45,"rgba(37,99,235,0.32)"),i.addColorStop(1,"rgba(0,0,0,0)")),s.fillStyle=i,s.fillRect(0,0,t,t);const a=new lt(e);return a.needsUpdate=!0,a}class ut{constructor(t,{profile:e="full"}={}){this.canvas=t,this.profile=e,this.calm=e==="calm",this.progress=0,this.targetProgress=0,this.velocity=0,this.targetVelocity=0,this.ignite=0,this.igniteTarget=1,this.pointer=new V(0,0),this.pointerTarget=new V(0,0),this.clock=new Q,this.reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches,this.dpr=Math.min(window.devicePixelRatio,2),this.renderer=new tt({canvas:t,alpha:!0,antialias:!0,powerPreference:"high-performance"}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(this.dpr),this.scene=new et,this.scene.fog=new it(461070,.05),this.camera=new st(50,window.innerWidth/window.innerHeight,.1,200),this.glowTexDark=Z(!1),this.glowTexLight=Z(!0),this.glowTex=this.glowTexDark,this.buildCore(),this.buildCage(),this.buildSingularity(),this.buildOrbits(),this.buildAurora(),this.buildStars(),this.bindEvents();const s=document.documentElement.getAttribute("data-theme")||"dark";this.setTheme(s),this.onResize(),this.loop()}get shapeStates(){return[{name:"shards",spread:3.4,radius:2,wire:0,swarm:.9,hue:.6,spin:.1,cage:.1,orbit:3.6,bond:.1},{name:"scatter",spread:6.5,radius:1.6,wire:0,swarm:1.6,hue:.62,spin:.16,cage:.06,orbit:3.9,bond:.16},{name:"converge",spread:2.2,radius:2.4,wire:.2,swarm:.7,hue:.59,spin:.2,cage:.22,orbit:3.3,bond:.3},{name:"build",spread:1.4,radius:2.7,wire:1,swarm:.5,hue:.58,spin:.24,cage:.62,orbit:3,bond:.52},{name:"name",spread:1,radius:2.9,wire:.7,swarm:.4,hue:.61,spin:.28,cage:.44,orbit:2.8,bond:.42},{name:"leap",spread:3,radius:2.2,wire:.4,swarm:1,hue:.59,spin:.34,cage:.3,orbit:3.4,bond:.28},{name:"merge",spread:.7,radius:3.1,wire:.3,swarm:.3,hue:.6,spin:.3,cage:.78,orbit:1.4,bond:.9},{name:"expand",spread:9,radius:3.4,wire:0,swarm:1.2,hue:.63,spin:.14,cage:.2,orbit:4.4,bond:.14}]}buildCore(){const t=window.innerWidth<760?9e3:22e3;this.count=this.calm?Math.round(t*.45):t;const e=new H,s=new Float32Array(this.count*3),i=new Float32Array(this.count*3),a=new Float32Array(this.count*3),l=new Float32Array(this.count),n=new Float32Array(this.count);for(let c=0;c<this.count;c++){const o=c*3,k=d(c+1),P=d(c+2),A=k*C,m=Math.acos(2*P-1),x=2+d(c+3)*.18;i[o]=x*Math.sin(m)*Math.cos(A),i[o+1]=x*Math.sin(m)*Math.sin(A),i[o+2]=x*Math.cos(m);const v=3.2+d(c+4)*5.5,I=d(c+5)*C,S=Math.acos(2*d(c+6)-1);a[o]=v*Math.sin(S)*Math.cos(I),a[o+1]=v*Math.cos(S)*.7,a[o+2]=v*Math.sin(S)*Math.sin(I),s[o]=i[o],s[o+1]=i[o+1],s[o+2]=i[o+2],l[c]=d(c+7),n[c]=.5+d(c+8)*2.2}e.setAttribute("position",new f(s,3)),e.setAttribute("aSphere",new f(i,3)),e.setAttribute("aScatter",new f(a,3)),e.setAttribute("aRandom",new f(l,1)),e.setAttribute("aSize",new f(n,1)),this.uniforms={uTime:{value:0},uProgress:{value:0},uSpread:{value:1},uRadius:{value:2},uSwarm:{value:.5},uWire:{value:0},uHue:{value:.6},uPixel:{value:700},uPointScale:{value:.012},uVelocity:{value:0},uIgnite:{value:0},uIsLight:{value:0}};const h=new B({uniforms:this.uniforms,transparent:!0,depthWrite:!1,blending:u,vertexShader:`
        attribute vec3 aSphere;
        attribute vec3 aScatter;
        attribute float aRandom;
        attribute float aSize;
        uniform float uTime;
        uniform float uSpread;
        uniform float uRadius;
        uniform float uSwarm;
        uniform float uWire;
        uniform float uPixel;
        uniform float uPointScale;
        uniform float uVelocity;
        uniform float uIgnite;
        uniform float uHue;
        uniform float uIsLight;
        varying float vAlpha;
        varying float vHue;

        void main() {
          float t = uTime * 0.35 + aRandom * 6.28318;

          // organic swirl
          vec3 swirl = vec3(
            sin(t * 0.7 + aSphere.y * 1.2),
            cos(t * 0.6 + aSphere.x * 1.1),
            sin(t * 0.5 + aSphere.z)
          ) * uSwarm * 0.35;

          vec3 sphere = normalize(aSphere) * (length(aSphere) * uRadius) + swirl;

          // lattice snap: pull points toward a quantised shell
          vec3 lat = floor(sphere * 2.0 + 0.5) / 2.0;
          sphere = mix(sphere, lat, uWire * 0.5);

          vec3 p = mix(sphere, aScatter + swirl * 2.0, uSpread);

          // ---- Scroll velocity: turbulence that stretches the form.
          float vAmt = abs(uVelocity);
          vec3 radial = normalize(p + 1e-4);
          vec3 curl = vec3(
            sin(p.y * 2.1 + uTime * 1.2),
            cos(p.z * 2.3 + uTime * 1.4),
            sin(p.x * 2.0 + uTime * 1.1)
          );
          p += radial * vAmt * 1.15 + curl * vAmt * 0.55;

          // ---- Ignition: the assembly-from-nothing intro.
          float born = 1.0 - uIgnite;
          vec3 birthDir = normalize(aScatter + aRandom + 1e-4);
          p += birthDir * born * 34.0;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;

          // Perspective-correct size
          float perspective = uPixel / max(-mv.z, 0.1);
          float pSize = clamp(aSize * uPointScale * perspective, 1.0, 4.5);
          gl_PointSize = uIsLight > 0.5 ? clamp(pSize * 1.3, 1.2, 5.2) : pSize;

          // Twinkle keeps the field alive without flicker.
          float twinkle = 0.78 + 0.22 * sin(uTime * 1.6 + aRandom * 40.0);
          vAlpha = mix(0.18, 0.9, 1.0 - uSpread * 0.5)
                 * (0.35 + aRandom * 0.65) * twinkle
                 * smoothstep(0.0, 0.35, uIgnite);
          vHue = fract(uHue + (aRandom - 0.5) * 0.10 + uSpread * 0.02 + vAmt * 0.04);
        }
      `,fragmentShader:`
        uniform float uHue;
        uniform float uIsLight;
        varying float vAlpha;
        varying float vHue;

        vec3 hsl2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
        }

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float soft = smoothstep(0.5, 0.06, d);

          // Dark mode: luminous electric cobalt & cyan glow
          vec3 darkCol = hsl2rgb(vec3(vHue, 0.88, 0.58));

          // Light mode: rich blueprint royal cobalt & deep sapphire ink
          vec3 lightCol = hsl2rgb(vec3(vHue, 0.96, 0.35));

          vec3 col = mix(darkCol, lightCol, uIsLight);
          float alpha = soft * vAlpha;
          if (uIsLight > 0.5) {
            alpha = min(alpha * 1.65, 0.95);
          }

          gl_FragColor = vec4(col, alpha);
        }
      `});this.core=new j(e,h),this.scene.add(this.core)}buildCage(){this.cages=[],[{r:3.15,detail:1,colorDark:2450411,colorLight:1920728,opDark:.26,opLight:.55,speed:.1},{r:3.95,detail:0,colorDark:3718648,colorLight:165063,opDark:.16,opLight:.4,speed:-.07}].forEach(e=>{const s=new at(e.r,e.detail),i=new _({color:e.colorDark,wireframe:!0,transparent:!0,opacity:e.opDark,blending:u,depthWrite:!1}),a=new Y(s,i);a.userData={speed:e.speed,spec:e},this.scene.add(a),this.cages.push(a)})}buildSingularity(){const t=new W({map:this.glowTexDark,color:6333946,transparent:!0,opacity:0,blending:u,depthWrite:!1});this.singularity=new E(t),this.singularity.scale.set(3.2,3.2,1),this.scene.add(this.singularity);const e=new W({map:this.glowTexDark,color:16777215,transparent:!0,opacity:0,blending:u,depthWrite:!1});this.singularityInner=new E(e),this.singularityInner.scale.set(1.1,1.1,1),this.scene.add(this.singularityInner)}buildOrbits(){this.nodeCount=6,this.nodes=[],this.nodeBase=[];const t=new W({map:this.glowTexDark,color:3718648,transparent:!0,opacity:.9,blending:u,depthWrite:!1});for(let a=0;a<this.nodeCount;a++){const l=new E(t.clone()),n=a/this.nodeCount*C;l.userData={angle:n,speed:.18+d(a+40)*.16,tilt:(d(a+41)-.5)*1.1,bob:d(a+42)*C,scale:.42+d(a+43)*.3},l.scale.setScalar(l.userData.scale),this.scene.add(l),this.nodes.push(l),this.nodeBase.push(n)}this.filamentGeo=new H;const e=new Float32Array(this.nodeCount*2*3);this.filamentGeo.setAttribute("position",new f(e,3));const s=new Float32Array(this.nodeCount*2);this.filamentGeo.setAttribute("aAlpha",new f(s,1));const i=new B({uniforms:{uOpacity:{value:0},uIsLight:{value:0}},transparent:!0,depthWrite:!1,blending:u,vertexShader:`
        attribute float aAlpha;
        varying float vA;
        void main() {
          vA = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uOpacity;
        uniform float uIsLight;
        varying float vA;
        void main() {
          vec3 darkCol = mix(vec3(0.14, 0.38, 0.96), vec3(0.22, 0.74, 0.96), vA);
          vec3 lightCol = mix(vec3(0.10, 0.28, 0.76), vec3(0.06, 0.48, 0.90), vA);
          vec3 col = mix(darkCol, lightCol, uIsLight);
          float a = vA * uOpacity * (uIsLight > 0.5 ? 1.35 : 1.0);
          gl_FragColor = vec4(col, min(a, 0.95));
        }
      `});this.filaments=new rt(this.filamentGeo,i),this.scene.add(this.filaments),this.filamentMat=i,this.filamentAlpha=this.filamentGeo.attributes.aAlpha}buildAurora(){this.ribbons=[];const t=[1920728,2450411,440020];for(let e=0;e<3;e++){const s=new nt(26,240,12,120),i=s.attributes.position,a=new Float32Array(i.count);for(let h=0;h<i.count;h++){const c=i.getY(h);a[h]=Math.sin(c*.08)*2.4+Math.sin(c*.31)*.7,i.setZ(h,a[h])}s.rotateX(-Math.PI/2),s.rotateZ(e*1.9);const l=new _({color:t[e],transparent:!0,opacity:.05,blending:u,depthWrite:!1,side:ot}),n=new Y(s,l);n.userData={base:a,geo:s,speed:.5+e*.25},n.position.set((e-1)*2.4,-10,-6-e*3),this.scene.add(n),this.ribbons.push(n)}}buildStars(){const e=new H,s=new Float32Array(2600*3);for(let i=0;i<2600;i++){const a=30+d(i+20)*70,l=d(i+21)*C,n=Math.acos(2*d(i+22)-1);s[i*3]=a*Math.sin(n)*Math.cos(l),s[i*3+1]=a*Math.cos(n),s[i*3+2]=a*Math.sin(n)*Math.sin(l)}e.setAttribute("position",new f(s,3)),this.stars=new j(e,new ht({size:.22,color:9741240,transparent:!0,opacity:.45,blending:u,depthWrite:!1})),this.scene.add(this.stars)}bindEvents(){window.addEventListener("resize",()=>this.onResize(),{passive:!0}),window.addEventListener("pointermove",t=>{this.pointerTarget.x=t.clientX/window.innerWidth*2-1,this.pointerTarget.y=-(t.clientY/window.innerHeight*2-1)},{passive:!0}),window.addEventListener("dcp:themechange",t=>{t.detail&&t.detail.theme&&this.setTheme(t.detail.theme)},{passive:!0})}setTheme(t){this.isLight=t==="light";const e=this.isLight?16317180:461070;this.scene&&this.scene.fog&&this.scene.fog.color.setHex(e),this.uniforms&&this.uniforms.uIsLight&&(this.uniforms.uIsLight.value=this.isLight?1:0),this.core&&this.core.material&&(this.core.material.blending=this.isLight?b:u,this.core.material.needsUpdate=!0),this.cages&&this.cages.forEach(i=>{const a=i.userData.spec;i.material.blending=this.isLight?b:u,a&&i.material.color.setHex(this.isLight?a.colorLight:a.colorDark),i.material.needsUpdate=!0});const s=this.isLight?this.glowTexLight:this.glowTexDark;if(this.singularity&&(this.singularity.material.map=s,this.singularity.material.blending=this.isLight?b:u,this.singularity.material.color.setHex(this.isLight?1920728:6333946),this.singularity.material.needsUpdate=!0),this.singularityInner&&(this.singularityInner.material.map=s,this.singularityInner.material.blending=this.isLight?b:u,this.singularityInner.material.color.setHex(this.isLight?2450411:16777215),this.singularityInner.material.needsUpdate=!0),this.nodes&&this.nodes.forEach(i=>{i.material.map=s,i.material.blending=this.isLight?b:u,i.material.color.setHex(this.isLight?1920728:3718648),i.material.needsUpdate=!0}),this.filamentMat&&(this.filamentMat.blending=this.isLight?b:u,this.filamentMat.uniforms.uIsLight&&(this.filamentMat.uniforms.uIsLight.value=this.isLight?1:0),this.filamentMat.needsUpdate=!0),this.ribbons){const i=[1920728,2450411,165063],a=[1920728,2450411,440020];this.ribbons.forEach((l,n)=>{l.material.blending=this.isLight?b:u,l.material.color.setHex(this.isLight?i[n]:a[n]),l.material.needsUpdate=!0})}this.stars&&(this.stars.material.blending=this.isLight?b:u,this.stars.material.color.setHex(this.isLight?2450411:9741240),this.stars.material.opacity=this.isLight?.35:.45,this.stars.material.needsUpdate=!0)}onResize(){const t=window.innerWidth,e=window.innerHeight;if(this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e),this.uniforms){const s=this.camera.projectionMatrix.elements[5];this.uniforms.uPixel.value=e*this.dpr*s/2}}setProgress(t){this.targetProgress=F.clamp(t,0,1)}setVelocity(t){this.targetVelocity=F.clamp(t,-1,1)}setIgnite(t){this.igniteTarget=F.clamp(t,0,1)}sampleStates(){const t=this.shapeStates,e=this.targetProgress*(t.length-1),s=Math.floor(e),i=e-s,a=t[Math.min(s,t.length-1)],l=t[Math.min(s+1,t.length-1)];return{a,b:l,f:i}}loop(){this.raf=requestAnimationFrame(()=>this.loop());const t=Math.min(this.clock.getDelta(),.05),e=this.clock.elapsedTime,s=this.reduced?1:.09;this.progress+=(this.targetProgress-this.progress)*s,this.velocity+=(this.targetVelocity-this.velocity)*(this.reduced?1:.08),this.ignite+=(this.igniteTarget-this.ignite)*(this.reduced?1:.045);const{a:i,b:a,f:l}=this.sampleStates(),n=r=>i[r]+(a[r]-i[r])*l,h=this.uniforms;h.uTime.value=this.reduced?0:e,h.uProgress.value=this.progress,h.uVelocity.value=this.reduced?0:this.velocity,h.uIgnite.value=this.ignite,h.uSpread.value+=(n("spread")/9-h.uSpread.value)*.08,h.uRadius.value+=(n("radius")/2-h.uRadius.value)*.08,h.uSwarm.value+=(n("swarm")-h.uSwarm.value)*.08,h.uWire.value+=(n("wire")-h.uWire.value)*.08,h.uHue.value+=(n("hue")-h.uHue.value)*.08;const c=n("spin"),o=Math.abs(this.velocity),k=this.calm?.5:1;this.reduced||(this.core.rotation.y+=t*(c*.5+o*.9)*k,this.core.rotation.x=Math.sin(e*.1)*.15);const P=n("cage")*this.ignite;this.cages.forEach((r,g)=>{const p=this.isLight?P*(g===0?1.2:.9)+.2:P*(g===0?1:.7);r.material.opacity+=(p-r.material.opacity)*.06,this.reduced||(r.rotation.y+=t*(r.userData.speed+o*.4)*(g===0?1:1.6),r.rotation.x+=t*r.userData.speed*.6),r.scale.setScalar(1+this.progress*.12+o*.06)});const A=1+Math.sin(e*1.35)*.1,m=this.ignite,x=1+o*.9,v=n("bond");if(this.singularity){const r=(this.isLight?2.6:3)*A*x*(.55+m*.45)*(1+v*.35);this.singularity.scale.set(r,r,1);const g=(this.isLight?.42+o*.35+v*.25:.3+o*.35+v*.25)*m;this.singularity.material.opacity+=(g-this.singularity.material.opacity)*.06}if(this.singularityInner){const r=(this.isLight?1.1:.85)*A*x*m;this.singularityInner.scale.set(r,r,1);const g=(this.isLight?.7+o*.3:.55+o*.3)*m;this.singularityInner.material.opacity+=(g-this.singularityInner.material.opacity)*.08}const I=n("orbit"),S=n("bond")*this.ignite,w=this.filamentGeo.attributes.position,D=this.filamentAlpha;this.nodes.forEach((r,g)=>{const p=r.userData,M=p.angle+e*p.speed*(this.reduced?0:1)+this.progress*2.2,y=Math.cos(p.tilt),R=Math.sin(p.tilt),z=Math.cos(M)*I,X=Math.sin(M)*I,$=Math.sin(e*.6+p.bob)*.55+Math.sin(M)*R*1.1,O=z,U=$+Math.cos(M)*0,G=X*y;r.position.set(O,U,G);const J=1+Math.sin(e*2+p.bob)*.18+o*.4;r.scale.setScalar(p.scale*J*(.6+this.ignite*.4));const K=(this.isLight?.8+o*.2:.5+o*.4)*this.ignite;r.material.opacity+=(K-r.material.opacity)*.08;const L=g*6;w.array[L]=0,w.array[L+1]=0,w.array[L+2]=0,w.array[L+3]=O,w.array[L+4]=U,w.array[L+5]=G,D.array[g*2]=.15,D.array[g*2+1]=1}),w.needsUpdate=!0,D.needsUpdate=!0;const N=this.isLight?S*.8+.16:S*.55;this.filamentMat.uniforms.uOpacity.value+=(N-this.filamentMat.uniforms.uOpacity.value)*.06,this.filaments.visible=this.filamentMat.uniforms.uOpacity.value>.01,this.ribbons.forEach((r,g)=>{if(this.reduced)return;const p=r.userData.geo.attributes.position,M=r.userData.base;for(let y=0;y<p.count;y++){const R=p.getY(y),z=M[y]+Math.sin(R*.06+e*r.userData.speed)*1.4;p.setZ(y,z)}p.needsUpdate=!0,r.material.opacity=this.isLight?.05+o*.04:.035+o*.05,r.rotation.z+=t*.012*(g%2?-1:1)});const q=14-this.progress*3.2+o*.8;this.pointer.lerp(this.pointerTarget,.04),this.camera.position.x+=(this.pointer.x*1.4-this.camera.position.x)*.05,this.camera.position.y+=(this.pointer.y*.9-this.camera.position.y)*.05,this.camera.position.z+=(q-this.camera.position.z)*.05,this.camera.lookAt(0,0,0),this.stars&&!this.reduced&&(this.stars.rotation.y=e*.012,this.stars.rotation.x=this.pointer.y*.05),this.renderer.render(this.scene,this.camera)}}export{ut as Scene};
