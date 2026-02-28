import { useEffect, useRef } from "react";
import * as THREE from "three";

const makeMaterial = (color, roughness = 0.42) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.12,
  });

export const JoinGameScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 2.4, 6.2);

    const ambient = new THREE.HemisphereLight("#ffd7a4", "#111528", 0.82);
    const key = new THREE.DirectionalLight("#fff4df", 1.25);
    key.position.set(4.2, 5.8, 3.6);
    const rim = new THREE.PointLight("#67dfff", 1.75, 14, 2);
    rim.position.set(-3, 3.2, -3);
    scene.add(ambient, key, rim);

    const world = new THREE.Group();
    scene.add(world);

    const stage = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.1, 0.62, 44), makeMaterial("#5d3f42", 0.78));
    stage.position.y = -1.02;
    world.add(stage);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.12, 16, 64), makeMaterial("#8fdcff", 0.28));
    ring.position.set(0, 0.72, -0.22);
    ring.rotation.x = Math.PI / 2;
    world.add(ring);

    const centerDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.26, 0.1, 44), makeMaterial("#2d3758", 0.35));
    centerDisc.position.set(0, 0.7, -0.2);
    world.add(centerDisc);

    const ticketGroup = new THREE.Group();
    const ticketGeo = new THREE.BoxGeometry(0.86, 0.22, 0.56);
    const ticketColors = ["#ffc972", "#88d8ff", "#ff9f89", "#9ff0c8"];
    const tickets = [];
    ticketColors.forEach((color, index) => {
      const ticket = new THREE.Mesh(ticketGeo, makeMaterial(color, 0.32));
      const angle = (index / ticketColors.length) * Math.PI * 2;
      ticket.position.set(Math.cos(angle) * 1.35, 0.72, Math.sin(angle) * 0.85 - 0.2);
      ticket.rotation.y = angle + 0.7;
      ticket.rotation.z = 0.08 * (index % 2 ? 1 : -1);
      ticketGroup.add(ticket);
      tickets.push(ticket);
    });
    world.add(ticketGroup);

    const makeAvatar = (x, z, bodyColor, eyeColor) => {
      const avatar = new THREE.Group();
      avatar.position.set(x, -0.45, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.74, 0.46), makeMaterial(bodyColor, 0.38));
      body.position.y = 0.52;
      avatar.add(body);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.4), makeMaterial("#f7f4ea", 0.3));
      head.position.y = 1;
      avatar.add(head);

      const eyeMat = new THREE.MeshStandardMaterial({ color: eyeColor, emissive: eyeColor, emissiveIntensity: 0.8 });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), eyeMat);
      const eyeR = eyeL.clone();
      eyeL.position.set(-0.1, 1.02, 0.2);
      eyeR.position.set(0.1, 1.02, 0.2);
      avatar.add(eyeL, eyeR);

      return { avatar, head };
    };

    const avatars = [
      makeAvatar(-1.05, 1.1, "#86d6ff", "#7efcff"),
      makeAvatar(0, 1.34, "#ffb074", "#ffd488"),
      makeAvatar(1.05, 1.1, "#9be8c3", "#85ffd4"),
    ];
    avatars.forEach((entry) => world.add(entry.avatar));

    const sparkles = [];
    const sparkleGeo = new THREE.SphereGeometry(0.034, 8, 8);
    for (let i = 0; i < 28; i += 1) {
      const sparkle = new THREE.Mesh(
        sparkleGeo,
        new THREE.MeshStandardMaterial({
          color: i % 2 ? "#ffe3a2" : "#8fe7ff",
          emissive: i % 2 ? "#ffbf62" : "#4fd9ff",
          emissiveIntensity: 1,
        })
      );
      const angle = (i / 28) * Math.PI * 2;
      sparkle.position.set(Math.cos(angle) * 2.25, 0.2 + (i % 6) * 0.22, Math.sin(angle) * 1.45 - 0.2);
      world.add(sparkle);
      sparkles.push(sparkle);
    }

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    mount.appendChild(renderer.domElement);
    resize();

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      world.rotation.y = Math.sin(t * 0.35) * 0.12;
      ring.rotation.z = t * 0.45;
      centerDisc.rotation.y = -t * 0.3;
      ticketGroup.rotation.y = -t * 0.2;

      tickets.forEach((ticket, index) => {
        ticket.position.y = 0.72 + Math.sin(t * 1.8 + index * 0.8) * 0.1;
        ticket.rotation.x = Math.sin(t * 2 + index) * 0.15;
      });

      avatars.forEach((entry, index) => {
        entry.avatar.position.y = -0.45 + Math.sin(t * 2.4 + index * 0.7) * 0.05;
        entry.head.rotation.y = Math.sin(t * 1.3 + index) * 0.18;
      });

      sparkles.forEach((sparkle, index) => {
        sparkle.position.y += Math.sin(t * 2.2 + index * 0.5) * 0.0018;
      });

      camera.position.x = Math.sin(t * 0.32) * 0.45;
      camera.position.y = 2.35 + Math.sin(t * 0.48) * 0.1;
      camera.lookAt(0, 0.75, -0.15);

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);

      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry?.dispose?.();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose?.());
        } else {
          obj.material?.dispose?.();
        }
      });

      renderer.dispose();
    };
  }, []);

  return <div className="join-game-scene" ref={mountRef} aria-hidden="true" />;
};
