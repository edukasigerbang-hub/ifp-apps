import {
  arrow,
  colors,
  fillCircle,
  fillPolygon,
  fillRect,
  plusSign,
  ring,
  star,
  strokeLine,
  strokeRect
} from "../illustrationKit.mjs";
import {
  apple,
  balanceScale,
  barChart,
  blockGroup,
  clockFace,
  comparePanels,
  cubeBlock,
  curveArrow,
  dashedBox,
  dotRow,
  drawShape,
  equalSideMarks,
  flat,
  fractionBar,
  magnifier,
  miniBarChart,
  miniClock,
  miniCrossedDots,
  miniCubeStack,
  miniDotRows,
  miniGrid,
  miniNumberLine,
  miniPerimeterRect,
  miniRings,
  miniRuler,
  miniScale,
  miniShapes,
  miniStarGrid,
  miniTable,
  miniTiles,
  pie,
  placeValueBoard,
  rightAngleMarks,
  ringAround,
  rod,
  ruler,
  summaryTrio,
  tableGrid,
  unit
} from "../activityScenes.mjs";

function dotCell(c, cx, cy, count, color = colors.teal) {
  dotRow(c, cx - ((count - 1) * 24) / 2, cy, count, 24, 8, color);
}

function minuteTicks(c, cx, cy, radius, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = ((-90 + (360 * i) / count) * Math.PI) / 180;
    const color = i < 5 ? colors.orange : colors.navy;
    strokeLine(
      c,
      cx + Math.cos(angle) * (radius - 22),
      cy + Math.sin(angle) * (radius - 22),
      cx + Math.cos(angle) * (radius - 6),
      cy + Math.sin(angle) * (radius - 6),
      i < 5 ? 4 : 2,
      color
    );
  }
}

export const PLAN = [
  {
    packageDir: "kelas3-matematika-b01-bilangan-10000",
    base: "aktivitas-bilangan-10000",
    summaryAlt: "Lima ilustrasi bilangan sampai 10.000: papan nilai tempat tiga ribuan empat ratusan lima puluhan dua satuan, kolom puluhan disorot, dua papan pembanding ribuan dan ratusan, tiga kartu rangkuman, dan tabel nilai tempat empat kolom.",
    steps: [
      {
        alt: "Papan nilai tempat empat kolom berisi tiga kubus ribuan, empat ratusan, lima batang puluhan, dan dua satuan.",
        draw(c) {
          placeValueBoard(c, 40, 90, 720, 420, [
            { kind: "cube", count: 3 },
            { kind: "flat", count: 4 },
            { kind: "rod", count: 5 },
            { kind: "unit", count: 2 }
          ]);
        }
      },
      {
        alt: "Papan nilai tempat yang sama dengan kolom puluhan berisi lima batang disorot oranye.",
        draw(c) {
          placeValueBoard(c, 40, 90, 720, 420, [
            { kind: "cube", count: 3 },
            { kind: "flat", count: 4 },
            { kind: "rod", count: 5, highlight: true },
            { kind: "unit", count: 2 }
          ]);
        }
      },
      {
        alt: "Dua papan nilai tempat: kiri tiga kubus ribuan dan empat ratusan, kanan tiga kubus ribuan dan lima ratusan; kolom ratusan kedua papan disorot oranye.",
        draw(c) {
          placeValueBoard(c, 50, 130, 330, 340, [
            { kind: "cube", count: 3 },
            { kind: "flat", count: 4, highlight: true }
          ]);
          placeValueBoard(c, 420, 130, 330, 340, [
            { kind: "cube", count: 3 },
            { kind: "flat", count: 5, highlight: true }
          ]);
        }
      },
      {
        alt: "Tiga kartu rangkuman: papan nilai tempat tiga kolom, tabel tiga kolom, dan garis bilangan bertitik.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) =>
              placeValueBoard(h, cx - 90, cy - 90, 180, 180, [
                { kind: "cube", count: 2 },
                { kind: "flat", count: 3 },
                { kind: "rod", count: 4 }
              ]),
            (h, cx, cy) => miniTable(h, cx, cy),
            (h, cx, cy) =>
              miniNumberLine(h, cx, cy, [
                [2, colors.teal],
                [6, colors.orange],
                [10, colors.blue]
              ])
          ]);
        }
      },
      {
        alt: "Tabel empat kolom nilai tempat berisi dua kubus ribuan, tiga ratusan, empat puluhan, dan lima satuan.",
        draw(c) {
          tableGrid(c, 60, 100, 680, 420, 4, 1);
          cubeBlock(c, 110, 200, 70);
          cubeBlock(c, 110, 300, 70);
          flat(c, 260, 190, 76);
          flat(c, 260, 290, 76);
          flat(c, 260, 390, 76);
          for (let i = 0; i < 4; i += 1) rod(c, 424 + i * 26, 200, 200);
          for (let i = 0; i < 5; i += 1) unit(c, 590 + (i % 2) * 44, 220 + Math.floor(i / 2) * 60);
        }
      }
    ]
  },
  {
    packageDir: "kelas3-matematika-b02-penjumlahan-pengurangan",
    base: "aktivitas-penjumlahan-pengurangan",
    summaryAlt: "Lima ilustrasi penjumlahan dan pengurangan: dua kelompok balok nilai tempat, sepuluh satuan digabung menjadi satu batang, satu batang diuraikan menjadi sepuluh satuan, tiga kartu rangkuman, dan kedua proses digabung dalam satu gambar.",
    steps: [
      {
        alt: "Dua kelompok balok nilai tempat: kiri dua ratusan empat puluhan lima satuan, kanan seratus dua puluhan tujuh satuan, dipisahkan tanda tambah.",
        draw(c) {
          blockGroup(c, 235, 500, { flats: 2, rods: 4, units: 5 }, 1.35);
          plusSign(c, 405, 300, 26, 9, colors.navy);
          blockGroup(c, 585, 500, { flats: 1, rods: 2, units: 7 }, 1.35);
        }
      },
      {
        alt: "Sepuluh satuan tersusun dua baris, panah melengkung menuju satu batang puluhan di sebelah kanan.",
        draw(c) {
          for (let i = 0; i < 10; i += 1) unit(c, 90 + (i % 5) * 44, 200 + Math.floor(i / 5) * 56, 30);
          curveArrow(c, 330, 250, 430, 250, 60, 6, colors.teal);
          rod(c, 470, 170, 230, 40);
        }
      },
      {
        alt: "Satu batang puluhan di kiri, panah melengkung menuju sepuluh satuan yang tersusun dua baris di kanan.",
        draw(c) {
          rod(c, 130, 170, 230, 40);
          curveArrow(c, 240, 260, 340, 260, 60, 6, colors.teal);
          for (let i = 0; i < 10; i += 1) unit(c, 400 + (i % 5) * 44, 200 + Math.floor(i / 5) * 56, 30);
        }
      },
      {
        alt: "Tiga kartu rangkuman: menara tiga kubus, titik-titik dengan tiga titik dicoret, dan dua ubin tanda tambah serta kurang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniCubeStack(h, cx, cy + 80, 3),
            (h, cx, cy) => miniCrossedDots(h, cx, cy, 7, 3),
            (h, cx, cy) => miniTiles(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Sepuluh satuan digabung menjadi satu batang puluhan, dan satu batang puluhan diuraikan kembali menjadi sepuluh satuan.",
        draw(c) {
          for (let i = 0; i < 10; i += 1) unit(c, 90 + (i % 5) * 44, 160 + Math.floor(i / 5) * 56);
          curveArrow(c, 330, 200, 430, 200, 60, 6, colors.teal);
          rod(c, 470, 130, 220, 34);
          strokeLine(c, 60, 380, 740, 380, 3, colors.muted);
          rod(c, 120, 420, 160, 34);
          curveArrow(c, 230, 500, 330, 500, 60, 6, colors.teal);
          for (let i = 0; i < 10; i += 1) unit(c, 380 + (i % 5) * 44, 420 + Math.floor(i / 5) * 56);
        }
      }
    ]
  },
  {
    packageDir: "kelas3-matematika-b03-perkalian-pembagian",
    base: "aktivitas-perkalian-pembagian",
    summaryAlt: "Lima ilustrasi perkalian dan pembagian: tiga lingkaran berisi empat bintang, empat lingkaran berisi tiga bintang, dua belas bintang dalam tiga baris berkotak, tiga kartu rangkuman, dan susunan bintang yang dikelompokkan.",
    steps: [
      {
        alt: "Tiga lingkaran berjajar, masing-masing berisi empat bintang kuning, dengan tanda tambah di antaranya.",
        draw(c) {
          for (let g = 0; g < 3; g += 1) {
            const cx = 170 + g * 230;
            ringAround(c, cx, 300, 90, 4, colors.blue);
            for (let i = 0; i < 4; i += 1) {
              star(c, cx - 30 + (i % 2) * 60, 300 - 30 + Math.floor(i / 2) * 60, 21, colors.sun, 3);
            }
          }
          plusSign(c, 285, 300, 12, 6, colors.navy);
          plusSign(c, 515, 300, 12, 6, colors.navy);
        }
      },
      {
        alt: "Empat lingkaran tersusun dua kali dua, masing-masing berisi tiga bintang kuning berjajar.",
        draw(c) {
          const spots = [
            [250, 190],
            [550, 190],
            [250, 430],
            [550, 430]
          ];
          for (const [cx, cy] of spots) {
            ringAround(c, cx, cy, 84, 4, colors.blue);
            for (let i = 0; i < 3; i += 1) star(c, cx - 34 + i * 34, cy, 18, colors.sun, 3);
          }
        }
      },
      {
        alt: "Dua belas bintang tersusun tiga baris empat kolom; setiap baris dikelilingi kotak garis putus-putus.",
        draw(c) {
          for (let row = 0; row < 3; row += 1) {
            const y = 170 + row * 130;
            dashedBox(c, 150, y - 48, 500, 96, colors.muted);
            for (let column = 0; column < 4; column += 1) {
              star(c, 220 + column * 120, y, 20, colors.sun, 3);
            }
          }
        }
      },
      {
        alt: "Tiga kartu rangkuman: susunan bintang tiga kali empat, tiga lingkaran berisi empat titik, dan dua ubin tanda tambah serta kurang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniStarGrid(h, cx, cy, 3, 4),
            (h, cx, cy) => miniRings(h, cx, cy, 3, 4),
            (h, cx, cy) => miniTiles(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Susunan empat kolom tiga baris bintang, lalu dua belas bintang yang dikelompokkan menjadi tiga lingkaran berisi empat bintang.",
        draw(c) {
          for (let row = 0; row < 3; row += 1) {
            for (let column = 0; column < 4; column += 1) {
              star(c, 110 + column * 70, 170 + row * 70, 26, colors.sun, 4);
            }
          }
          arrow(c, 330, 250, 400, 250, 6, colors.navy);
          for (let g = 0; g < 3; g += 1) {
            const centerY = 180 + 150 * g;
            ringAround(c, 500, centerY, 62, 4, colors.blue);
            for (let i = 0; i < 4; i += 1) {
              star(c, 470 + (i % 2) * 60, centerY - 30 + Math.floor(i / 2) * 60, 18, colors.sun, 3);
            }
          }
        }
      }
    ]
  },
  {
    packageDir: "kelas3-matematika-b04-pecahan",
    base: "aktivitas-pecahan",
    summaryAlt: "Lima ilustrasi pecahan: lingkaran dan batang terbagi dua dengan satu bagian diwarnai, lingkaran dan batang terbagi tiga, perbandingan setengah dan seperempat, tiga kartu pie rangkuman, dan gabungan kelima gambar pecahan.",
    steps: [
      {
        alt: "Lingkaran terbagi dua sama besar dengan satu bagian diwarnai teal, dan batang terbagi dua dengan satu bagian diwarnai.",
        draw(c) {
          pie(c, 220, 300, 150, 2, 1);
          fillRect(c, 470, 240, 260, 120, colors.pale);
          fractionBar(c, 440, 220, 320, 140, 2, 1);
        }
      },
      {
        alt: "Lingkaran terbagi tiga sama besar dengan satu bagian diwarnai, dan batang terbagi tiga dengan satu bagian diwarnai biru.",
        draw(c) {
          pie(c, 220, 300, 150, 3, 1);
          fractionBar(c, 440, 220, 320, 140, 3, 1, colors.blue);
        }
      },
      {
        alt: "Panel kiri batang dua bagian dengan satu bagian diwarnai; panel kanan batang empat bagian dengan satu bagian diwarnai lebih kecil.",
        draw(c) {
          comparePanels(
            c,
            (h, cx, cy) => {
              fractionBar(h, cx - 120, cy - 45, 240, 90, 2, 1);
            },
            (h, cx, cy) => {
              fractionBar(h, cx - 120, cy - 45, 240, 90, 4, 1, colors.blue);
            }
          );
        }
      },
      {
        alt: "Tiga kartu rangkuman berisi pie terbagi dua, tiga, dan empat dengan satu bagian diwarnai.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => pie(h, cx, cy, 66, 2, 1),
            (h, cx, cy) => pie(h, cx, cy, 66, 3, 1),
            (h, cx, cy) => pie(h, cx, cy, 66, 4, 1)
          ]);
        }
      },
      {
        alt: "Lingkaran terbagi dua dengan satu bagian diwarnai, batang terbagi tiga dengan satu bagian, dan batang terbagi empat dengan tiga bagian. Baris bawah: lingkaran terbagi empat dengan satu bagian dan batang terbagi dua dengan satu bagian.",
        draw(c) {
          pie(c, 170, 200, 110, 2, 1);
          fractionBar(c, 340, 90, 360, 66, 3, 1);
          fractionBar(c, 340, 240, 360, 66, 4, 3, colors.blue);
          strokeLine(c, 60, 350, 740, 350, 3, colors.muted);
          pie(c, 170, 470, 90, 4, 1);
          fractionBar(c, 340, 440, 360, 66, 2, 1);
        }
      }
    ]
  },
  {
    packageDir: "kelas3-matematika-b05-bangun-datar",
    base: "aktivitas-bangun-datar-ciri",
    summaryAlt: "Lima ilustrasi bangun datar: empat bangun berjajar, persegi dengan tanda sisi dan sudut siku-siku, perbandingan persegi dan persegi panjang, tiga kartu rangkuman, dan susunan bangun membentuk rumah.",
    steps: [
      {
        alt: "Empat bangun datar berjajar: lingkaran teal, persegi kuning, segitiga biru, dan persegi panjang merah muda.",
        draw(c) {
          drawShape(c, "circle", 130, 300, 150, { fill: colors.teal });
          drawShape(c, "square", 310, 300, 160, { fill: colors.sun });
          drawShape(c, "triangle", 490, 300, 170, { fill: colors.blue });
          drawShape(c, "rectangle", 680, 300, 140, { fill: colors.redLight });
        }
      },
      {
        alt: "Persegi besar dengan tanda pendek di tengah setiap sisi dan tanda sudut siku-siku di keempat sudutnya.",
        draw(c) {
          drawShape(c, "square", 400, 300, 280, { fill: colors.tealLight });
          equalSideMarks(c, 400, 300, 280);
          rightAngleMarks(c, 400, 300, 280);
        }
      },
      {
        alt: "Panel kiri persegi dengan tanda sisi sama panjang; panel kanan persegi panjang dengan tanda sudut siku-siku dan sisi mendatar lebih panjang.",
        draw(c) {
          comparePanels(
            c,
            (h, cx, cy) => {
              drawShape(h, "square", cx, cy, 150, { fill: colors.tealLight });
              equalSideMarks(h, cx, cy, 150);
            },
            (h, cx, cy) => {
              drawShape(h, "rectangle", cx, cy, 170, { fill: colors.blueLight });
              rightAngleMarks(h, cx, cy, 170);
            }
          );
        }
      },
      {
        alt: "Tiga kartu rangkuman: lingkaran persegi segitiga, persegi dan persegi panjang, serta dua ubin bangun datar.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniShapes(h, cx, cy, ["circle", "square", "triangle"]),
            (h, cx, cy) => miniShapes(h, cx, cy, ["square", "rectangle", "circle"]),
            (h, cx, cy) => miniTiles(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Susunan bangun datar membentuk rumah: persegi sebagai badan, segitiga sebagai atap, persegi panjang sebagai pintu, lingkaran sebagai jendela, dan lingkaran matahari.",
        draw(c) {
          fillRect(c, 180, 260, 300, 240, colors.pale);
          strokeRect(c, 180, 260, 300, 240, 6, colors.navy);
          fillPolygon(c, [[330, 110], [170, 260], [490, 260]], colors.redLight);
          strokeLine(c, 330, 110, 170, 260, 6, colors.navy);
          strokeLine(c, 330, 110, 490, 260, 6, colors.navy);
          fillRect(c, 270, 360, 90, 140, colors.tealLight);
          strokeRect(c, 270, 360, 90, 140, 5, colors.navy);
          fillCircle(c, 400, 330, 34, colors.sky);
          ring(c, 400, 330, 34, 5, colors.navy);
          fillCircle(c, 640, 120, 52, colors.sun);
          ring(c, 640, 120, 52, 5, colors.navy);
        }
      }
    ]
  },
  {
    packageDir: "kelas3-matematika-b06-keliling-luas",
    base: "aktivitas-keliling-luas",
    summaryAlt: "Lima ilustrasi keliling dan luas: persegi panjang dengan panah keliling, persegi panjang berpetak lima kali empat, persegi satuan disorot dengan kaca pembesar, tiga kartu rangkuman, dan perbandingan keliling serta luas.",
    steps: [
      {
        alt: "Persegi panjang dengan panah teal mengelilingi keempat tepinya searah jarum jam.",
        draw(c) {
          strokeRect(c, 180, 140, 440, 320, 8, colors.navy);
          strokeLine(c, 180, 100, 400, 100, 6, colors.teal);
          arrow(c, 350, 100, 400, 100, 6, colors.teal);
          strokeLine(c, 650, 140, 650, 330, 6, colors.teal);
          arrow(c, 650, 280, 650, 330, 6, colors.teal);
          strokeLine(c, 620, 490, 180, 490, 6, colors.teal);
          arrow(c, 250, 490, 180, 490, 6, colors.teal);
          strokeLine(c, 150, 460, 150, 140, 6, colors.teal);
          arrow(c, 150, 220, 150, 140, 6, colors.teal);
        }
      },
      {
        alt: "Persegi panjang berpetak lima kolom empat baris; seluruh dua puluh kotak diwarnai teal.",
        draw(c) {
          const cell = 82;
          const x = 200;
          const y = 140;
          for (let row = 0; row < 4; row += 1) {
            for (let column = 0; column < 5; column += 1) {
              fillRect(c, x + column * cell, y + row * cell, cell, cell, colors.tealLight);
            }
          }
          for (let i = 0; i <= 5; i += 1) strokeLine(c, x + i * cell, y, x + i * cell, y + 4 * cell, 3, colors.navy);
          for (let i = 0; i <= 4; i += 1) strokeLine(c, x, y + i * cell, x + 5 * cell, y + i * cell, 3, colors.navy);
          strokeRect(c, x, y, 5 * cell, 4 * cell, 7, colors.navy);
        }
      },
      {
        alt: "Persegi satuan tiga kali tiga, satu kotak tengah disorot oranye, dan kaca pembesar di atasnya.",
        draw(c) {
          const cell = 96;
          const x = 200;
          const y = 156;
          for (let row = 0; row < 3; row += 1) {
            for (let column = 0; column < 3; column += 1) {
              const highlighted = row === 1 && column === 1;
              const cellFill = highlighted ? colors.orangeLight : colors.tealLight;
              fillRect(c, x + column * cell, y + row * cell, cell, cell, cellFill);
            }
          }
          for (let i = 0; i <= 3; i += 1) strokeLine(c, x + i * cell, y, x + i * cell, y + 3 * cell, 4, colors.navy);
          for (let i = 0; i <= 3; i += 1) strokeLine(c, x, y + i * cell, x + 3 * cell, y + i * cell, 4, colors.navy);
          strokeRect(c, x, y, 3 * cell, 3 * cell, 7, colors.navy);
          magnifier(c, 630, 200, 62);
        }
      },
      {
        alt: "Tiga kartu rangkuman: persegi panjang berpanah keliling, petak lima kali empat dengan tujuh kotak diwarnai, dan petak empat kali empat dengan sembilan kotak diwarnai.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniPerimeterRect(h, cx, cy),
            (h, cx, cy) => miniGrid(h, cx, cy, 5, 4, 7),
            (h, cx, cy) => miniGrid(h, cx, cy, 4, 4, 9)
          ]);
        }
      },
      {
        alt: "Panel kiri: persegi panjang dengan panah mengelilingi keempat tepinya. Panel kanan: persegi panjang yang sama terbagi kotak-kotak satuan yang seluruhnya diwarnai.",
        draw(c) {
          strokeLine(c, 410, 80, 410, 520, 3, colors.muted);
          strokeRect(c, 90, 160, 260, 220, 8, colors.navy);
          strokeLine(c, 90, 120, 350, 120, 5, colors.teal);
          arrow(c, 300, 120, 350, 120, 5, colors.teal);
          strokeLine(c, 380, 160, 380, 380, 5, colors.teal);
          arrow(c, 380, 330, 380, 380, 5, colors.teal);
          strokeLine(c, 350, 412, 90, 412, 5, colors.teal);
          arrow(c, 140, 412, 90, 412, 5, colors.teal);
          strokeLine(c, 60, 380, 60, 160, 5, colors.teal);
          arrow(c, 60, 210, 60, 160, 5, colors.teal);
          for (let row = 0; row < 4; row += 1) {
            for (let column = 0; column < 5; column += 1) {
              fillRect(c, 460 + column * 52, 160 + row * 55, 52, 55, colors.tealLight);
            }
          }
          for (let i = 0; i <= 5; i += 1) strokeLine(c, 460 + i * 52, 160, 460 + i * 52, 380, 3, colors.navy);
          for (let i = 0; i <= 4; i += 1) strokeLine(c, 460, 160 + i * 55, 720, 160 + i * 55, 3, colors.navy);
          strokeRect(c, 460, 160, 260, 220, 7, colors.navy);
        }
      }
    ]
  },
  {
    packageDir: "kelas3-matematika-b07-waktu-panjang-berat",
    base: "aktivitas-waktu-panjang-berat",
    summaryAlt: "Lima ilustrasi waktu panjang berat: jam dengan enam puluh garis menit, penggaris seratus pembagian, timbangan satu kilogram dan apel, tiga kartu rangkuman, dan gabungan jam penggaris serta timbangan.",
    steps: [
      {
        alt: "Jam besar dengan enam puluh garis menit di tepi lingkaran; lima garis pertama disorot oranye.",
        draw(c) {
          clockFace(c, 400, 300, 200, 12, 0);
          minuteTicks(c, 400, 300, 200, 60);
        }
      },
      {
        alt: "Penggaris panjang dengan seratus pembagian kecil; sepuluh pembagian pertama ditandai kotak oranye.",
        draw(c) {
          ruler(c, 80, 230, 640, 90, 100);
          strokeRect(c, 80, 230, 64, 90, 5, colors.orange);
        }
      },
      {
        alt: "Timbangan dua lengan: beban satu kilogram di lengan kiri dan empat apel di lengan kanan.",
        draw(c) {
          balanceScale(c, 400, 560, 150);
          fillRect(c, 218, 406, 64, 48, colors.blueLight);
          strokeRect(c, 218, 406, 64, 48, 5, colors.navy);
          apple(c, 522, 428, 24);
          apple(c, 574, 428, 24);
          apple(c, 534, 392, 22);
          apple(c, 566, 392, 22);
        }
      },
      {
        alt: "Tiga kartu rangkuman: jam dinding, penggaris berskala, dan timbangan dua lengan.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniClock(h, cx, cy, 7, 30),
            (h, cx, cy) => miniRuler(h, cx, cy),
            (h, cx, cy) => miniScale(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Jam, penggaris panjang dengan seratus pembagian, dan timbangan dua lengan dengan beban satu kilogram.",
        draw(c) {
          clockFace(c, 170, 180, 100, 7, 30);
          ruler(c, 330, 130, 400, 70, 100);
          strokeLine(c, 60, 300, 740, 300, 3, colors.muted);
          balanceScale(c, 380, 520, 120);
          fillRect(c, 228, 372, 64, 48, colors.blueLight);
          strokeRect(c, 228, 372, 64, 48, 5, colors.navy);
          apple(c, 500, 392, 26);
        }
      }
    ]
  },
  {
    packageDir: "kelas3-matematika-b08-penyajian-data",
    base: "aktivitas-penyajian-data",
    summaryAlt: "Lima ilustrasi penyajian data: tabel berisi titik jumlah, diagram batang empat batang, batang tertinggi disorot dengan kaca pembesar, tiga kartu rangkuman, dan gabungan diagram gambar, diagram batang, serta tabel.",
    steps: [
      {
        alt: "Tabel empat kolom tiga baris; baris judul berwarna dan dua baris berikutnya berisi titik-titik jumlah yang berbeda.",
        draw(c) {
          tableGrid(c, 80, 120, 640, 340, 4, 3);
          dotCell(c, 320, 290, 4);
          dotCell(c, 480, 290, 2);
          dotCell(c, 640, 290, 6);
          dotCell(c, 320, 403, 3, colors.blue);
          dotCell(c, 480, 403, 5, colors.blue);
          dotCell(c, 640, 403, 4, colors.blue);
        }
      },
      {
        alt: "Diagram batang empat batang berbeda tinggi di atas sumbu mendatar dan tegak.",
        draw(c) {
          barChart(c, 110, 110, 580, 380, [4, 2, 6, 3]);
        }
      },
      {
        alt: "Diagram batang dengan batang tertinggi berwarna oranye dan kaca pembesar di dekatnya.",
        draw(c) {
          barChart(c, 110, 110, 580, 380, [4, 2, 6, 3], { highlight: 2 });
          magnifier(c, 650, 140, 54);
        }
      },
      {
        alt: "Tiga kartu rangkuman: tabel kecil, baris titik, dan diagram batang tiga batang dengan batang tertinggi ditandai.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniTable(h, cx, cy),
            (h, cx, cy) => miniDotRows(h, cx, cy, [4, 2, 5]),
            (h, cx, cy) => miniBarChart(h, cx, cy, [3, 6, 2], 1)
          ]);
        }
      },
      {
        alt: "Diagram gambar berisi baris-baris titik, diagram batang dengan empat batang berbeda tinggi, dan tabel kosong dua baris.",
        draw(c) {
          const rows = [4, 2, 6, 3];
          rows.forEach((count, rowIndex) => {
            const rowY = 110 + rowIndex * 62;
            fillRect(c, 70, rowY, 270, 46, colors.pale);
            strokeRect(c, 70, rowY, 270, 46, 3, colors.navy);
            dotRow(c, 92, rowY + 23, count, 40, 12, colors.teal);
          });
          barChart(c, 430, 120, 290, 280, [4, 2, 6, 3], { highlight: 2 });
          strokeLine(c, 60, 430, 740, 430, 3, colors.muted);
          tableGrid(c, 70, 460, 620, 110, 4, 2);
        }
      }
    ]
  }
];
