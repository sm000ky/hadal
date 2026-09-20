<div align="center">

# 🌊 HADAL // -10,994M
### Precision 3D WebGL Descent into Earth's Deepest Abyss

[![React 18](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Audio](https://img.shields.io/badge/Web_Audio-Pure_Synthesizer-00f0ff?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)
[![Authors: sm000ky & Zero Two](https://img.shields.io/badge/Crafted_by-sm000ky_%26_Zero_Two-FF3366?style=for-the-badge&logo=github)](https://github.com/sm000ky)

<p align="center">
  <b>Sebuah mahakarya eksplorasi spasial 3D WebGL sinematik menembus titik terdalam di muka bumi: Challenger Deep, Palung Mariana (-10.994 Meter). Menggabungkan fisika kepunahan optik air laut (Beer-Lambert Law), simulasi salju laut GPU, telemetri tekanan hidrostatik riil, dan sintesis audio bawah air prosedural murni.</b>
</p>

```
  🌊 HADAL // MARIANA TRENCH EXPLORATION PROTOCOL
  =============================================================
  [DEPTH]     0.0M -> -10,994.0M (CHALLENGER DEEP)
  [PRESSURE]  1.0 ATM -> 1,086.0 ATM (15,960 PSI / 1.1 TON/CM²)
  [OPTICS]    EPIPELAGIC -> MESOPELAGIC -> BATHY -> HADAL VOID
  [AUDIO]     70S SIR DAVID ATTENBOROUGH (BBC DEEP OCEAN) + PROCEDURAL SYNTH
  =============================================================
```

</div>

---

## 📖 Tentang Hadal // -10,994M

Sementara manusia kerap mendambakan penjelajahan bintang di luar angkasa, bumi menyimpan kosmos terdalamnya sendiri di dasar samudra. Pada kedalaman 11 kilometer di bawah permukaan laut barat Samudra Pasifik, lempeng tektonik purba menunjam curam ke dalam mantel bumi, menciptakan **Challenger Deep**—jurang abadi bertekanan ribuan ton yang tak pernah tersentuh sinar matahari sejak jutaan tahun silam.

**Hadal** dirancang sebagai pengalaman *cinematic scrollytelling* interaktif mandiri (*self-playing*) tanpa jeda scroll, membawa pengguna menyelam menembus 5 zona samudra dengan akurasi sains dan kedalaman emosional tinggi.

---

## ✨ Fitur & Arsitektur Utama

### 1. 🔬 Optical Water Extinction Shader (Hukum Beer-Lambert)
Spektrum warna cahaya matahari diserap bertahap oleh air laut. Shader GLSL dan sistem kabut eksponensial diatur secara dinamis mengikuti kedalaman:
- **0m – 200m (Epipelagic / Sunlight Zone):** Air toska cerah dengan bias gelombang kaustik permukaan dan hamburan cahaya alami.
- **200m – 1.000m (Mesopelagic / Twilight Zone):** Spektrum merah punah total; air berubah menjadi nila-ungu gelap di mana cahaya alami memudar.
- **1.000m – 4.000m (Bathypelagic / Midnight Zone):** Kegelapan total (*aphotic realm*). Hanya lampu sorot kapal selam yang mampu menembus pekatnya air.
- **6.000m – 10.994m (Hadalpelagic / Mariana Trench):** Ngarai basalt tektonik curam dengan ventilasi hidrotermal aktif dan partikel termal keemasan.

### 2. 🎛️ Dual Volumetric Spotlights & GPU Marine Snow
- **Volumetric Light Cones:** Dua lampu sorot kapal selam berbahan *additive shader* berotasi mengikuti gerakan trim dan kemudi wahana.
- **Salju Laut (Marine Snow):** 2.800 partikel detritus organik laut dalam yang melayang perlahan dengan turbulensi arus dinamis. Partikel berpendar lembut saat melintasi sorot lampu.

### 3. 🎧 Master Waveform Clock & Procedural Hydrophone Audio Synth
- **Audio Clock Source of Truth:** Seluruh pergerakan kedalaman, animasi kamera, dan pergantian subtitle diikat langsung ke `audio.currentTime` vokal narasi bariton (77 detik, 20 cue berpresisi milidetik).
- **Pure Web Audio Ambient Synthesizer:**
  - *Pink Noise Resonant Lowpass Filter:* Meredam frekuensi tinggi secara bertahap (380Hz ke 52Hz) saat menyelam, menghadirkan efek kedap suara bertekanan berat.
  - *Tectonic Sub-Bass Rumble (34Hz):* Getaran lempeng samudera Pasifik berfrekuensi rendah.
  - *Active Sonar Acoustic Ping:* Sinyal sonar 1.180 Hz dengan pantulan gema akustik tebing palung (+380ms delay).
  - *Dynamic Ducking:* Musik dan gemuruh samudra otomatis meluruh 12dB saat narator berbicara.

### 4. 🎴 Tipografi Subtitle Melayang (Dual-Layer Film Dissolve)
- Subtitle ditempatkan di sepertiga bawah layar (*lower-third*) tanpa kotak hitam kaku (*pure floating typography*) agar 85% kanvas 3D tetap bersih.
- Transisi teks menggunakan pelarutan lapis ganda murni (*GPU composited crossfade*) berkecepatan 120 FPS tanpa lag.
- Tersedia dalam 3 bahasa: **English (EN)**, **Bahasa Indonesia (ID)**, dan **Japanese (JA)**.

### 5. 📂 Asymmetric Frustum Shift & 6 Archival Dossiers
Saat narasi berakhir atau tombol *ARCHIVES* ditekan, kamera menerapkan prinsip **Shift Lens / Asymmetric Frustum** (`camera.setViewOffset(...)`):
- Kapal selam bergeser anggun ke sisi kanan tanpa terdistorsi elips, membuka panggung di sisi kiri untuk membaca kartu arsip bersejarah:
  1. *Bathyscaphe Trieste (1960)* — Penyelaman berawak pertama Piccard & Walsh (-10.916m).
  2. *Deepsea Challenger (2012)* — Penyelaman solo James Cameron (-10.908m).
  3. *DSV Limiting Factor (2019)* — Rekor selam komersial berulang Victor Vescovo (-10.928m).
  4. *Mariana Snailfish (Pseudoliparis swirei)* — Vertebrata hidup terdalam di muka bumi.
  5. *Serpentinite Hydrothermal Chimneys* — Menara mineral ventilasi kemosintesis.
  6. *The Subduction Scar* — Geofisika penunjaman Lempeng Pasifik ke mantel bumi.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **3D Graphics:** Three.js (r160) + Custom GLSL Shaders
- **Audio:** Web Audio API (Oscillators, BiquadFilters, BufferSources) + HTML5 Audio
- **Styling:** Tailwind CSS (Obsidian Void & Hadal Cyan Palette)
- **Typography:** Newsreader (Serif), Cinzel, JetBrains Mono
- **Icons:** Lucide React

---

## 👥 Authors & Contributors

| Contributor | Role |
|---|---|
| [**sm000ky**](https://github.com/sm000ky) | Vision, Creative Direction & Lead Developer |
| **Zero Two** (`002`) | Autonomous Engine Co-Pilot, 3D Shaders & Web Audio Engineering |

---

<div align="center">
  <sub>"In the deepest wound of our living planet, life still endures." — sm000ky × Zero Two 💕🌊</sub>
</div>
