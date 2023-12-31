import './style.css'
import { MSDFTextGeometry, MSDFTextMaterial, uniforms } from "three-msdf-text";
import * as THREE from 'three';
import GUI from 'lil-gui'
import gsap from 'gsap';
import sphereVertexShader from '../shaders/sphere/vertexShader.glsl';
import sphereFragmentShader from '../shaders/sphere/fragmentShader.glsl';
import textVertexShader from '../shaders/text/vertexShader.glsl';
import textFragmentShader from '../shaders/text/fragmentShader.glsl';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

/* 
** 
************ Params 
**
*/

// -- Intro 
let isIntro = true
let title = null
let subtitle = null
let textMaterial = null;
const startBtn = document.querySelector('#startBtn')
const introContainer = document.querySelector('header')

// -- Transitions
const sections = document.querySelectorAll('.section')
const container = document.querySelector('main')
const titles = document.querySelectorAll('h2')
const bullets = document.querySelectorAll('.sidebar-bullet')
const nthSection = sections.length
let currentSection = 0
const transitionDuration = 3
let transitionStart
let scrollIsDown
let transitionRunning = false

// -- Boost 
const boostDuration = 1
let oldValues = {}

// Controls 
const controls = document.querySelector('.controls')
let controlsOpened = false

// -- Sizes 
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// -- Mouse & cursor
const cursorContainer = document.querySelector('.cursor-container');
const cursor = document.querySelector('.cursor');
const cursorTrails = document.querySelectorAll('.cursor-trail');
let isHovering = false
let isHolding = false;
let mouseHasMoved = false;

const mouse = {
  x: null,
  y: null
}

// -- Camera

const cameraParamsIntroDesktop = {
  posX: 0, 
  posY: 0, 
  posZ: 1.4,
  rotX: 0, 
  rotY: 0, 
  rotZ: 0
}

const cameraParamsSectionDesktop = {
  posX: 0, 
  posY: 0,
  posZ: 5,
  rotX: 0, 
  rotY: 0, 
  rotZ: 0
}

const cameraParamsIntroMobile = {
  posX: 0, 
  posY: 0, 
  posZ: 1.65,
  rotX: 0, 
  rotY: 0, 
  rotZ: 0
}

const cameraParamsSectionMobile = {
  posX: 0, 
  posY: 0,
  posZ: 6.3,
  rotX: 0, 
  rotY: 0, 
  rotZ: 0
}

let currentCameraIntro = cameraParamsIntroDesktop;
let currentCameraSection = cameraParamsSectionDesktop;

// -- Shader 

let shaderParamsIntro = {
  /* Fragment */
  u_fSpeed: 0.1, 
  u_offset1 : 0.3, 
  u_offset2 : 0.1, 
  u_fFrequency : 3, 
  u_rotation : 2.5,
  u_noiseFactor: 2, 
  u_lightBlur: 0.7,
  u_lightIntensity: 1.4,
  u_baseColor: new THREE.Color(0x050119),
  u_color1 : new THREE.Color(0X002733),
  u_color2 : new THREE.Color(0x7a0606), 
  u_color3 : new THREE.Color(0x4b2406),
  /* Vertex */
  u_vSpeed : 1,
  u_sphereWidth: 0,
  u_waveFactor : 0,
  u_waveAmplitude : 0,
  u_waveFrequency : 0,
  u_distortionFactor: 0,
  u_distortionFrequency: 0,
  u_distortionAmplitude : 0,  
}

let shaderParams0 = {
  /* Fragment */
  u_fSpeed: 0.1, 
  u_offset1 : 0.3, 
  u_offset2 : 0.1, 
  u_fFrequency : 3, 
  u_rotation : 6,
  u_noiseFactor: 1, 
  u_lightBlur: 0.7,
  u_lightIntensity: 1.4,
  u_baseColor: new THREE.Color(0x000000),
  u_color1 : new THREE.Color(0X3a5a64),
  u_color2 : new THREE.Color(0x8f2519), 
  u_color3 : new THREE.Color(0xddaa83), 
  /* Vertex */
  u_vSpeed : 1,
  u_sphereWidth: 0,
  u_waveFactor : 0,
  u_waveAmplitude : 0,
  u_waveFrequency : 0,
  u_distortionFactor: 0,
  u_distortionFrequency: 0,
  u_distortionAmplitude : 0,
}

let shaderParams1 = {
  /* Fragment */
  u_fSpeed: 0, 
  u_offset1 : 0.4, 
  u_offset2 : 0.1, 
  u_fFrequency : 0, 
  u_rotation : 0, 
  u_noiseFactor: 1,
  u_lightBlur: 2,
  u_lightIntensity: 3,
  u_baseColor: new THREE.Color(0x0fa3ae),
  u_color1 : new THREE.Color(0x000000),
  u_color2 : new THREE.Color(0x000000), 
  u_color3 : new THREE.Color(0x0b0a09), 
  /* Vertex */
  u_vSpeed : 1,
  u_sphereWidth: 1,
  u_waveFactor : 1,
  u_waveAmplitude : 0.3,
  u_waveFrequency : 8,
  u_distortionFactor: 0,
  u_distortionFrequency: 0,
  u_distortionAmplitude : 0,
}

let shaderParams2 = {
  /* Fragment */
  u_fSpeed: 0, 
  u_offset1 : 0.1, 
  u_offset2 : 0.4, 
  u_fFrequency : 90, 
  u_rotation : 1.64, 
  u_noiseFactor: 1,
  u_lightBlur: 1.5,
  u_lightIntensity: 1.5,
  u_baseColor: new THREE.Color(0x000000),
  u_color1 : new THREE.Color(0x4010FA),
  u_color2 : new THREE.Color(0x5E1912), 
  u_color3 : new THREE.Color(0xE6731B), 
  /* Vertex */
  u_vSpeed : 1,
  u_waveFactor : 0,
  u_waveAmplitude : 0,
  u_waveFrequency : 0,
  u_sphereWidth: 0,
  u_distortionFactor: 1,
  u_distortionFrequency: 4,
  u_distortionAmplitude : 0.4,
}

let shaderParams3 = {
  /* Fragment */
  u_fSpeed: 0, 
  u_offset1 : 0.4, 
  u_offset2 : 0.15, 
  u_fFrequency : 10, 
  u_rotation : 1.64, 
  u_noiseFactor: 0,
  u_lightBlur: 2,
  u_lightIntensity: 1,
  u_baseColor: new THREE.Color(0xe89687),
  u_color1 : new THREE.Color(0xffffff),
  u_color2 : new THREE.Color(0x000000), 
  u_color3 : new THREE.Color(0x000000), 
  /* Vertex */
  u_vSpeed : 1,
  u_sphereWidth: 0.1,
  u_waveFactor : 0.2,
  u_waveAmplitude : 2.17,
  u_waveFrequency : 40,
  u_distortionFactor: 0.9,
  u_distortionFrequency: 2,
  u_distortionAmplitude : 0.33,
}

let shaderParams4 = {
  /* Fragment */
  u_fSpeed: 0, 
  u_offset1 : 0.4, 
  u_offset2 : 0.13, 
  u_fFrequency : 17, 
  u_rotation : 9,
  u_noiseFactor: 1,
  u_lightBlur: 2,
  u_lightIntensity: 1.2,
  u_baseColor: new THREE.Color(0xd6c7c7),
  u_color1 : new THREE.Color(0x88d96),
  u_color2 : new THREE.Color(0x411f2a), 
  u_color3 : new THREE.Color(0x1e0613), 
  /* Vertex */
  u_vSpeed : 1,
  u_sphereWidth: 0.1,
  u_waveFactor : 0.7,
  u_waveAmplitude : 0.8,
  u_waveFrequency : 3,
  u_distortionFactor: 0,
  u_distortionFrequency: 0,
  u_distortionAmplitude : 0,
}

const shaderVariations = [shaderParams0, shaderParams1, shaderParams2, shaderParams3, shaderParams4]

/* 
** 
************ SET UP 
**
*/

// -- Canvas
const canvas = document.querySelector('#canvas');

// -- Scene
const scene = new THREE.Scene();

// -- Clock
const clock = new THREE.Clock();

// -- Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setClearColor(0x0F0C0D)
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// -- Camera

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.01, 100 );
camera.position.set(currentCameraIntro.posX, currentCameraIntro.posY, currentCameraIntro.posZ);
camera.rotation.set(currentCameraIntro.rotX, currentCameraIntro.rotY, currentCameraIntro.rotZ);
scene.add(camera);

/*  
**
************ Raycaster
**
*/

const raycaster = new THREE.Raycaster()

/*  
**
************ MSDF Font
**
*/

function loadFontAtlas(path) {
  const promise = new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(path, resolve);
  });

  return promise;
}

function loadFont(path) {
  const promise = new Promise((resolve, reject) => {
      const loader = new FontLoader() 
      loader.load(path, resolve);
  });

  return promise;
}

Promise.all([
  loadFontAtlas("/fonts/formula-condensed/formulacondensed-light.png"),
  loadFont("/fonts/formula-condensed/formulacondensed-light.fnt"),
]).then(([atlas, font]) => {

  const geometryTitle = new MSDFTextGeometry({
      text: "BLOB MUSEUM",
      font: font.data, 
  });
  const geometrySubtitle = new MSDFTextGeometry({
    text: "A COLLECTION OF SPHERE DISTORTIONS",
    font: font.data,
    letterSpacing: 10
  })

  textMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    defines: {
        IS_SMALL: false,
    },
    extensions: {
        derivatives: true,
    },
    uniforms: {
        // Common
        ...uniforms.common,
        // Rendering
        ...uniforms.rendering,
        // Strokes
        ...uniforms.strokes,
        // Layout
        uLinesTotal: { value: geometryTitle.layout.linesTotal },
        uLettersTotal: { value: geometryTitle.layout.lettersTotal },
        uWordsTotal: { value: geometryTitle.layout.wordsTotal },
        uStrokeColor: { value : new THREE.Color(0xffffff)},
        //custom
        u_mouse : { value : [-100, -100]}, 
        u_time : { value : clock.getElapsedTime()},
        u_op: { value : 1}
    },
    vertexShader: textVertexShader,
    fragmentShader: textFragmentShader,
});
 
  textMaterial.uniforms.uMap.value = atlas;

  title = new THREE.Mesh(geometryTitle, textMaterial);
  const tScale = 0.0011
  const tOffset = 0.004;
  title.scale.set(tScale, tScale, tScale);
  title.rotation.set(-Math.PI, 0, 0)
  title.geometry.computeBoundingBox()
  const tBb = title.geometry.boundingBox
  const tW = (tBb.max.x - tBb.min.x) * tScale
  const tH = (tBb.max.y - tBb.min.x) * tScale
  title.position.set(- tW * 0.5, tH * 0.5 + tOffset, 1)
  scene.add(title)

  subtitle = new THREE.Mesh(geometrySubtitle, textMaterial);
  const sScale = 0.0002
  const sOffset = 0.015
  subtitle.scale.set(sScale, sScale, sScale);
  subtitle.rotation.set(-Math.PI, 0, 0)
  subtitle.geometry.computeBoundingBox()
  const bb = subtitle.geometry.boundingBox
  const sW = (bb.max.x - bb.min.x) * sScale
  const sH = (bb.max.y - bb.min.x) * sScale
  subtitle.position.set(- sW * 0.5, sH * 0.5 - sOffset, 1)
  scene.add(subtitle);
});


/*  
**
************ Sphere
**
*/

const shaderMaterial = new THREE.ShaderMaterial({
  wireframe: false,
  vertexShader: sphereVertexShader,
  fragmentShader: sphereFragmentShader, 
  uniforms: {
    /* General */
    u_time : {
      value : clock.getElapsedTime()
    }, 
    /* Fragment */
    u_fSpeed: {
      value : shaderParamsIntro.u_fSpeed,
    },
    u_offset1 : {
      value : shaderParamsIntro.u_offset1,
    }, 
    u_offset2 : {
      value : shaderParamsIntro.u_offset2, 
    },
    u_fFrequency : {
      value : shaderParamsIntro.u_fFrequency
    },
    u_rotation : {
      value : shaderParamsIntro.u_rotation
    },
    u_noiseFactor : {
      value : shaderParamsIntro.u_noiseFactor
    },
    u_lightBlur : {
      value : shaderParamsIntro.u_lightBlur
    },
    u_lightIntensity : {
      value : shaderParamsIntro.u_lightIntensity
    },
    u_baseColor: {
      value: new THREE.Color(shaderParamsIntro.u_baseColor)
    },
    u_color1 : {
      value : new THREE.Color(shaderParamsIntro.u_color1)
    },
    u_color2 : {
      value : new THREE.Color(shaderParamsIntro.u_color2)
    }, 
    u_color3 : {
      value : new THREE.Color(shaderParamsIntro.u_color3)
    },
    /* Vertex */
    u_vSpeed : {
      value : shaderParamsIntro.u_vSpeed
    }, 
    u_waveFactor : {
      value : shaderParamsIntro.u_waveFactor
    }, 
    u_waveAmplitude : {
      value : shaderParamsIntro.u_waveAmplitude
    },
    u_waveFrequency : {
      value : shaderParamsIntro.u_waveFrequency
    },
    u_sphereWidth : {
      value : shaderParamsIntro.u_sphereWidth
    },
    u_distortionFactor : {
      value : shaderParamsIntro.u_distortionFactor
    },
    u_distortionFrequency : {
      value : shaderParamsIntro.u_distortionFrequency
    },
    u_distortionAmplitude : {
      value : shaderParamsIntro.u_distortionAmplitude
    }
  }
});

const sphereGeometry = new THREE.SphereGeometry(1, 100, 100);
const sphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
scene.add(sphere)


/*  
**
*********** Functions
**
*/

// -- Section transitions

const animateText = (prev, next) => {
  let prevTitle;
  let prevParagraph;

  if(prev !== null){
    prevTitle = sections[prev].querySelector('h2');
    prevParagraph = sections[prev].querySelector('p');
  }
  const nextTitle = sections[next].querySelector('h2');
  const nextParagraph = sections[next].querySelector('p');

  // 1. Update bullets
  updatebullets();

  // 2. Fade prev section
  if(prevTitle){
    const chars = prevTitle.children;
    for (let c of chars) {
      gsap.effects.fadeOut(c, {
        delay: Math.random(),
        duration: (Math.random() + 0.1),
      });
    }
  } 
  
  if(prevParagraph){
    gsap.effects.fadeOut(prevParagraph, {
      delay: 0,
      duration: 1,
    })
  }

  // 3. Update active section
  gsap.delayedCall(2, updateSection)

  // 4. Fade next section
  if(nextTitle){
    const chars = nextTitle.children;
    for (let c of chars) {
      gsap.effects.fadeIn(c, {
        opacity : Math.random() * 0.4 + 0.6,
        delay:  2 + Math.random(),
        duration: Math.random() + 2, 
      });
    }
  }

  if(nextParagraph){
    gsap.effects.fadeIn(nextParagraph, {
      opacity: 1,
      delay:  2,
      duration: 2,
    })
  }
}

const updateSection = () => {
  sections.forEach( (s, i) => {
    s.classList.remove('active')
    if(i === currentSection ) s.classList.add('active');
  })
}

const updatebullets = () => {
  bullets.forEach( (b, i) => {
    b.classList.remove('active')
    b.classList.remove('visited')
    if(i === currentSection) b.classList.add('active')
    if(i < currentSection) b.classList.add('visited')
  })
}

const updateShader = () => {

  for(let u in shaderMaterial.uniforms){

    if( u !== 'u_time') {
      const currentValue = shaderMaterial.uniforms[u].value;
      const targetValue = shaderVariations[currentSection][u]
      
      if(currentValue !== targetValue && targetValue !== undefined){
        if(currentValue.isColor){
          gsap.to(
            shaderMaterial.uniforms[u].value, {
              r : targetValue.r, 
              g : targetValue.g, 
              b : targetValue.b, 
              duration: transitionDuration
            }
          )
        }
        else if (u == 'u_fSpeed' || u== 'u_vSpeed'){
          shaderMaterial.uniforms[u].value = targetValue
        }
        else {
          gsap.to(
            shaderMaterial.uniforms[u], {
              value : targetValue, 
              duration: transitionDuration
            }
          )
        }
      }      
    }
  }

  shaderMaterial.needsUpdate = true
}

const updateCamera = (newPosition) => {
    gsap.to(camera.position, {
        x: newPosition.posX, 
        y: newPosition.posY, 
        z: newPosition.posZ, 
        duration: transitionDuration, 
        ease: "power1.out"
      }
    )
    gsap.to(camera.rotation, {
        x: newPosition.rotX, 
        y: newPosition.rotY, 
        z: newPosition.rotZ, 
        duration: transitionDuration
      }
    )
}

const updateGui = () => {
  gui.folders.forEach( f => {
    if (f._title !== 'camera'){
      f.controllers.forEach( c => {
        if(c.property !== 'wireframe'){
          c.object = shaderVariations[currentSection]
        }
      })
    }
  })
}

// -- Boost

const boost = () => {
  oldValues.vSpeed = shaderMaterial.uniforms.u_vSpeed.value
  oldValues.lightIntensity = shaderMaterial.uniforms.u_lightIntensity.value
  
  // Speed
  setTimeout(() => {
    if(isHolding){
        shaderMaterial.uniforms.u_vSpeed.value = oldValues.vSpeed + 2;
    }
  }, 300)

  // Light
  gsap.to (shaderMaterial.uniforms.u_lightIntensity, {
    value : oldValues.lightIntensity + 3,
    duration: boostDuration
  })

  // Zoom
  gsap.to( camera, {
    zoom: 1.3 ,
    duration: boostDuration,
    onUpdate: function () {
      camera.updateProjectionMatrix();
    }
  });

  // Fade dom
  container.classList.add('hide')
}

const unboost = () => {

  // Speed
  shaderMaterial.uniforms.u_vSpeed.value = oldValues.vSpeed
 
  // Light
  gsap.to (shaderMaterial.uniforms.u_lightIntensity, {
    value : oldValues.lightIntensity,
    duration: boostDuration
  })

  // Zoom
  gsap.to( camera, {
    duration: boostDuration,
    zoom: 1,
    onUpdate: function () {
      camera.updateProjectionMatrix();
    }
  });

  // Display dom
  container.classList.remove('hide')
}

// -- Utils

const splitText = (text) => {
  text.forEach( t => {
    let content = t.textContent
    const length = content.length
    let letters = []

    for( let i = 0; i < length; i++){
      letters.push(content.slice(0,1));
      content = content.slice(1);
    }

    t.innerHTML = null;

    for(let l of letters){
      t.innerHTML += `<span class="chars">${l}</span>`
    }
  })
}

const adjustCamera = () => {
  if(window.innerWidth < 768){
    currentCameraIntro = cameraParamsIntroMobile
    currentCameraSection = cameraParamsSectionMobile
  }
  else {
    currentCameraIntro = cameraParamsIntroDesktop
    currentCameraSection = cameraParamsSectionDesktop
  }

  if(isIntro){
    camera.position.set(currentCameraIntro.posX, currentCameraIntro.posY, currentCameraIntro.posZ)
    camera.rotation.set(currentCameraIntro.rotX, currentCameraIntro.rotY, currentCameraIntro.rotZ)
  }
  else {
    camera.position.set(currentCameraSection.posX, currentCameraSection.posY, currentCameraSection.posZ)
    camera.rotation.set(currentCameraSection.rotX, currentCameraSection.rotY, currentCameraSection.rotZ)
  }
}


/*  
**
************ GSAP Effects
**
*/

gsap.registerEffect({
  name: "fadeIn",
  effect: (targets, config) => {
      return gsap.fromTo(targets, {opacity: 0}, {
        opacity: config.opacity, 
        duration: config.duration, 
        delay: config.delay, 
      });
  }
});

gsap.registerEffect({
  name: "fadeOut",
  effect: (targets, config) => {
      return gsap.to(targets, {
        opacity: 0, 
        duration: config.duration, 
        delay: config.delay, 
        overwrite: true 
      });
  }
});

/*  
**
************ EVENTS
**
*/

// -- Resize 
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    adjustCamera()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

// -- Click & hold
const downListeners = ['mousedown', 'touchstart']

downListeners.forEach( listener => {
  window.addEventListener(listener, () => {
    if(isHovering){
      isHolding = true;
      cursorContainer.classList.add('hold')    
      boost()
  
      if(controlsOpened) gui.domElement.classList.add('hide')
    }
  })
})

const upListeners = ['mouseup', 'touchend']

upListeners.forEach( listener => {
  window.addEventListener(listener, () => {
    if(isHolding){
      isHolding = false;
      cursorContainer.classList.remove('hold')
      unboost()
  
      if(controlsOpened) gui.domElement.classList.remove('hide')
    }
  })
})

// -- Mouse Move 

window.addEventListener('mousemove', (e) => {
  
  if(!mouseHasMoved){
    mouseHasMoved = true
    setTimeout( () =>   cursorContainer.style.display = 'block', 200 )
  }

  // Update mouse coordinates
  mouse.x = e.clientX / sizes.width * 2 - 1
  mouse.y = - (e.clientY / sizes.height * 2 - 1)

  // Move camera
  if(!isHolding){
    gsap.to(camera.rotation, {
      x: mouse.y * 0.015, 
      y: - mouse.x * 0.015, 
      duration: 1,
      ease : 'power2.InOut'
      
    })
  }

  // Move cursor
  const cursorSize = cursor.clientWidth;
  cursor.style.top = (e.clientY - cursorSize * 0.5)  + 'px' 
  cursor.style.left = (e.clientX - cursorSize * 0.5) + 'px'
  
  cursorTrails.forEach((t, i) => {
    const trailSize = t.clientWidth;
    gsap.to(t, 
      {
        top: (e.clientY - trailSize * 0.5)  + 'px',
        left: (e.clientX - trailSize * 0.5) + 'px', 
        duration: 0.5 + i * 0.2, 
        ease: 'power1.out'
      }
    )
  })
    
  if(isHovering){
    cursorContainer.classList.add('hover');
  }
  else {
    cursorContainer.classList.remove('hover')
  }
})

// -- Scroll 

window.addEventListener('wheel', (e) => {
 
  if(!isIntro & !gui.domElement.contains(e.target)){

    if(clock.getElapsedTime() > transitionStart + transitionDuration) transitionRunning = false
  
    if (!transitionRunning) {
      transitionStart = clock.getElapsedTime()
      transitionRunning = true
      const prevSection = currentSection
      scrollIsDown =  e.wheelDeltaY < 0 ? true : false
      currentSection = scrollIsDown ? currentSection + 1 : currentSection - 1 
  
      if(currentSection < 0) currentSection = nthSection - 1
      if (currentSection > nthSection - 1) currentSection = 0
  
      if(currentSection >= 0 && currentSection <= nthSection - 1) {
        updateShader()
        updateGui()
        animateText(prevSection, currentSection)
      }
    }
  }
})

// -- Bullet click

bullets.forEach( (b, i) => {
  b.addEventListener('click', () => {
    const prevSection = currentSection
    currentSection = i
    updateShader()
    updateGui()
    animateText(prevSection, currentSection)
  })
})

// -- Enable controls 

controls.addEventListener('click', () => {
  controlsOpened = !controlsOpened

  if(controlsOpened){
    gui.show();
    controls.textContent='Hide controls'
  }
  else {
    gui.hide();
    controls.textContent='Show controls'
  }
})

// -- Intro button

startBtn.addEventListener('click', () => {
  startBtn.classList.add('active')
  gsap.to(textMaterial.uniforms.u_op, 
    {
      value: 0,
      duration: 1,
    }
  )
  gsap.delayedCall(1, () => {
    isIntro = false;
    currentSection = 0;
    scene.remove(title)
    scene.remove(subtitle)
    introContainer.classList.add('hide');
    container.classList.remove('hide');
    updateShader()
    updateCamera(currentCameraSection)
    animateText(null, currentSection);
  })
})


/*  
**
************ DEBUG GUI
**
*/

const gui = new GUI();
gui.hide()

/* Fragment Shader */  
const fragmentFolder = gui.addFolder('Fragment Shader')
fragmentFolder.add(shaderVariations[currentSection], 'u_fSpeed').min(0).max(10).step(0.001).name('fSpeed').onChange( () => shaderMaterial.uniforms.u_fSpeed.value = shaderVariations[currentSection].u_fSpeed).listen()
fragmentFolder.add(shaderVariations[currentSection], 'u_offset1').min(0).max(0.4).step(0.01).name('offset1').onChange( () => shaderMaterial.uniforms.u_offset1.value = shaderVariations[currentSection].u_offset1).listen()
fragmentFolder.add(shaderVariations[currentSection], 'u_offset2').min(0).max(0.4).step(0.01).name('offset2').onChange( () => shaderMaterial.uniforms.u_offset2.value = shaderVariations[currentSection].u_offset2).listen()
fragmentFolder.add(shaderVariations[currentSection], 'u_fFrequency').min(0).max(100).step(1).name('fFrequency').onChange( () => shaderMaterial.uniforms.u_fFrequency.value = shaderVariations[currentSection].u_fFrequency).listen()
fragmentFolder.add(shaderVariations[currentSection], 'u_rotation').min(0).max(10).step(0.01).name('rotation').onChange( () => shaderMaterial.uniforms.u_rotation.value = shaderVariations[currentSection].u_rotation).listen()
fragmentFolder.add(shaderVariations[currentSection], 'u_noiseFactor').min(0).max(2).step(0.001).name('noiseFactor').onChange( () => shaderMaterial.uniforms.u_noiseFactor.value = shaderVariations[currentSection].u_noiseFactor).listen()
fragmentFolder.add(shaderVariations[currentSection], 'u_lightBlur').min(0).max(2).step(0.001).name('lightBlur').onChange( () => shaderMaterial.uniforms.u_lightBlur.value = shaderVariations[currentSection].u_lightBlur).listen()
fragmentFolder.add(shaderVariations[currentSection], 'u_lightIntensity').min(0).max(3).step(0.1).name('lightIntensity').onChange( () => shaderMaterial.uniforms.u_lightIntensity.value = shaderVariations[currentSection].u_lightIntensity).listen()
fragmentFolder.add(shaderMaterial, 'wireframe').name('wireframe')
fragmentFolder.addColor(shaderVariations[currentSection], 'u_baseColor').name('baseColor').onChange( () => shaderMaterial.uniforms.u_baseColor.value = new THREE.Color(shaderVariations[currentSection].u_baseColor)).listen()
fragmentFolder.addColor(shaderVariations[currentSection], 'u_color1').name('color1').onChange( () => shaderMaterial.uniforms.u_color1.value = new THREE.Color(shaderVariations[currentSection].u_color1)).listen()
fragmentFolder.addColor(shaderVariations[currentSection], 'u_color2').name('color2').onChange( () => shaderMaterial.uniforms.u_color2.value = new THREE.Color(shaderVariations[currentSection].u_color2)).listen()
fragmentFolder.addColor(shaderVariations[currentSection], 'u_color3').name('color3').onChange( () => shaderMaterial.uniforms.u_color3.value = new THREE.Color(shaderVariations[currentSection].u_color3)).listen()

/* Vertex Shader */
const vertexFolder = gui.addFolder('Vertex Shader')
vertexFolder.add(shaderVariations[currentSection], 'u_vSpeed').min(0).max(10).step(0.001).name('vSpeed').onChange( () => shaderMaterial.uniforms.u_vSpeed.value = shaderVariations[currentSection].u_vSpeed).listen()
vertexFolder.add(shaderVariations[currentSection], 'u_sphereWidth').min(-1).max(1).step(0.1).name('sphereWidth').onChange( () => shaderMaterial.uniforms.u_sphereWidth.value = shaderVariations[currentSection].u_sphereWidth).listen()
vertexFolder.add(shaderVariations[currentSection], 'u_waveFactor').min(0).max(1).step(0.1).name('waveFactor').onChange( () => shaderMaterial.uniforms.u_waveFactor.value = shaderVariations[currentSection].u_waveFactor).listen()
vertexFolder.add(shaderVariations[currentSection], 'u_waveAmplitude').min(0).max(5).step(0.001).name('waveAmplitude').onChange( () => shaderMaterial.uniforms.u_waveAmplitude.value = shaderVariations[currentSection].u_waveAmplitude).listen()
vertexFolder.add(shaderVariations[currentSection], 'u_waveFrequency').min(0).max(100).step(1).name('waveFrequency').onChange( () => shaderMaterial.uniforms.u_waveFrequency.value = shaderVariations[currentSection].u_waveFrequency).listen()
vertexFolder.add(shaderVariations[currentSection], 'u_distortionFactor').min(0).max(1).step(0.001).name('distortionFactor').onChange( () => shaderMaterial.uniforms.u_distortionFactor.value = shaderVariations[currentSection].u_distortionFactor).listen()
vertexFolder.add(shaderVariations[currentSection], 'u_distortionFrequency').min(0).max(100).step(1).name('distortionFrequency').onChange( () => shaderMaterial.uniforms.u_distortionFrequency.value = shaderVariations[currentSection].u_distortionFrequency).listen()
vertexFolder.add(shaderVariations[currentSection], 'u_distortionAmplitude').min(0).max(5).step(0.001).name('distortionAmplitude').onChange( () => shaderMaterial.uniforms.u_distortionAmplitude.value = shaderVariations[currentSection].u_distortionAmplitude).listen()

// /* Camera */
// const cameraFolder = gui.addFolder('Camera')
// cameraFolder.add(cameraParamsIntroDesktop, 'posX').min(-10).max(10).step(0.001).name('camPosX').onChange ( () => camera.position.x = cameraParamsIntroDesktop.posX).listen()
// cameraFolder.add(cameraParamsIntroDesktop, 'posY').min(-10).max(10).step(0.001).name('camPosY').onChange ( () => camera.position.y = cameraParamsIntroDesktop.posY).listen()
// cameraFolder.add(cameraParamsIntroDesktop, 'posZ').min(-10).max(10).step(0.001).name('camPosZ').onChange ( () => camera.position.z = cameraParamsIntroDesktop.posZ).listen()
// cameraFolder.add(cameraParamsIntroDesktop, 'rotX').min(-10).max(10).step(0.001).name('camRotX').onChange ( () => camera.rotation.x = cameraParamsIntroDesktop.rotX).listen()
// cameraFolder.add(cameraParamsIntroDesktop, 'rotY').min(-10).max(10).step(0.001).name('camRotY').onChange ( () => camera.rotation.y = cameraParamsIntroDesktop.rotY).listen()
// cameraFolder.add(cameraParamsIntroDesktop, 'rotZ').min(-10).max(10).step(0.001).name('camRotZ').onChange ( () => camera.rotation.z = cameraParamsIntroDesktop.rotZ).listen()

/*  
**
************ RENDER 
**
*/


const render = () => {
    
  // Raycaster
  raycaster.setFromCamera(mouse, camera)

  // Update uniforms
  shaderMaterial.uniforms.u_time.value = clock.getElapsedTime()
  
  
  if(isIntro){
    if(title !== null && subtitle !== null && textMaterial !== null) {
      textMaterial.uniforms.u_time.value = clock.getElapsedTime()

      if(mouseHasMoved){
        const mousePosition = new THREE.Vector3(mouse.x, mouse.y, 0.94);
        mousePosition.unproject(camera);
        textMaterial.uniforms.u_mouse.value = [mousePosition.x, mousePosition.y];
      }
    }
  }
  else {
    isHovering = (raycaster.intersectObject(sphere).length > 0) ? true : false
  }

  // Animate
  renderer.render(scene,camera);
  window.requestAnimationFrame(render);
}

splitText(titles)
adjustCamera();
render();
/* 
  TOODO
  - block hold in transition

    EXTRA : 
      - BackGround three
      - scss
      - seperate files

    LA FIN :
      > Reflection ? 
      > Domain warp ? 
      > Sphere rolling ?
      > DISCO BALLLLLL ?

*/