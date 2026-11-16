import {
  arrow,
  checkMark,
  colors,
  dashedLine,
  equalsSign,
  fillCircle,
  fillPolygon,
  fillRect,
  minusSign,
  plusSign,
  ring,
  ringSegment,
  strokeLine,
  strokeRect
} from "../illustrationKit.mjs";
import {
  angleFigure,
  barChart,
  books,
  cube3d,
  cubeBlock,
  curveArrow,
  cylinder3d,
  ellipseOutline,
  factorArcs,
  flat,
  flowStep,
  fractionBar,
  glass,
  magnifier,
  miniAngle,
  miniAreaGrid,
  miniBarChart,
  miniCheckLoop,
  miniCone,
  miniCube,
  miniCylinder,
  miniFactorArc,
  miniNet,
  miniNumberLine,
  miniTable,
  note,
  numberLine,
  operationTile,
  placeValueBoard,
  ringAround,
  rod,
  summaryTrio,
  tableGrid,
  unit
} from "../activityScenes.mjs";

function multipleVenn(c) {
  const r = 190;
  const gap = 150;
  const cx = 400;
  const cy = 300;
  fillCircle(c, cx - gap / 2, cy, r, colors.pale);
  fillCircle(c, cx + gap / 2, cy, r, colors.pale);
  const a = (Math.acos(gap / 2 / r) * 180) / Math.PI;
  const lens = [];
  for (let t = -a; t <= a; t += 2) {
    const rad = (t * Math.PI) / 180;
    lens.push([cx - gap / 2 + Math.cos(rad) * r, cy + Math.sin(rad) * r]);
  }
  for (let t = 180 - a; t <= 180 + a; t += 2) {
    const rad = (t * Math.PI) / 180;
    lens.push([cx + gap / 2 + Math.cos(rad) * r, cy + Math.sin(rad) * r]);
  }
  fillPolygon(c, lens, colors.orangeLight);
  ring(c, cx - gap / 2, cy, r, 6, colors.navy);
  ring(c, cx + gap / 2, cy, r, 6, colors.navy);
  fillCircle(c, 246, 214, 16, colors.teal);
  fillCircle(c, 226, 300, 16, colors.teal);
  fillCircle(c, 246, 386, 16, colors.teal);
  fillCircle(c, 356, 266, 18, colors.orange);
  fillCircle(c, 444, 334, 18, colors.orange);
  fillCircle(c, 554, 234, 16, colors.blue);
  fillCircle(c, 566, 366, 16, colors.blue);
}

export const PLAN = [
  {
    packageDir: "kelas5-matematika-b01-bilangan-1000000",
    base: "aktivitas-bilangan-1000000",
    summaryAlt: "Lima ilustrasi bilangan sampai 1.000.000: papan nilai tempat enam kolom, kolom puluh ribuan disorot, dua papan pembanding, tiga kartu rangkuman, dan tabel nilai tempat enam kolom.",
    steps: [
      {
        alt: "Papan nilai tempat enam kolom berisi empat kubus ratus ribuan, lima kubus puluh ribuan, dua ribuan, tiga ratusan, satu puluhan, dan enam satuan.",
        draw(c) {
          placeValueBoard(c, 25, 90, 750, 440, [
            { kind: "cube", count: 4 },
            { kind: "cube", count: 5 },
            { kind: "flat", count: 2 },
            { kind: "rod", count: 3 },
            { kind: "rod", count: 1 },
            { kind: "unit", count: 6 }
          ]);
        }
      },
      {
        alt: "Papan nilai tempat enam kolom dengan kolom puluh ribuan berisi lima kubus disorot oranye.",
        draw(c) {
          placeValueBoard(c, 25, 90, 750, 440, [
            { kind: "cube", count: 4 },
            { kind: "cube", count: 5, highlight: true },
            { kind: "flat", count: 2 },
            { kind: "rod", count: 3 },
            { kind: "rod", count: 1 },
            { kind: "unit", count: 6 }
          ]);
        }
      },
      {
        alt: "Dua papan enam kolom bertumpuk; kolom puluh ribuan disorot oranye dengan lima kubus di papan atas dan sembilan kubus di papan bawah.",
        draw(c) {
          placeValueBoard(c, 40, 60, 720, 220, [
            { kind: "cube", count: 4 },
            { kind: "cube", count: 5, highlight: true },
            { kind: "flat", count: 2 },
            { kind: "rod", count: 3 },
            { kind: "rod", count: 1 },
            { kind: "unit", count: 6 }
          ]);
          placeValueBoard(c, 40, 320, 720, 220, [
            { kind: "cube", count: 4 },
            { kind: "cube", count: 9, highlight: true },
            { kind: "flat", count: 2 },
            { kind: "rod", count: 3 },
            { kind: "rod", count: 1 },
            { kind: "unit", count: 6 }
          ]);
        }
      },
      {
        alt: "Tiga kartu rangkuman: menara tiga kubus, tabel kecil, dan garis bilangan bertitik.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniCube(h, cx, cy),
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
        alt: "Enam kolom nilai tempat berisi empat kubus ratus ribuan, lima kubus puluh ribuan, dua ribuan, tiga ratusan, satu puluhan, dan enam satuan.",
        draw(c) {
          tableGrid(c, 30, 100, 740, 420, 6, 1);
          for (let i = 0; i < 4; i += 1) cubeBlock(c, 44, 160 + i * 84, 50);
          for (let i = 0; i < 5; i += 1) cubeBlock(c, 168, 140 + i * 70, 40);
          flat(c, 296, 220, 64);
          flat(c, 296, 310, 64);
          for (let i = 0; i < 3; i += 1) rod(c, 424 + i * 26, 220, 180);
          rod(c, 560, 260, 140, 26);
          for (let i = 0; i < 6; i += 1) unit(c, 668 + (i % 2) * 44, 220 + Math.floor(i / 2) * 56);
        }
      }
    ]
  },
  {
    packageDir: "kelas5-matematika-b02-operasi-pecahan",
    base: "aktivitas-operasi-pecahan",
    summaryAlt: "Lima ilustrasi operasi pecahan: penjumlahan seperempat dan dua perempat, pengurangan tiga perempat dan seperempat, tiga batang bertumpuk dengan pembagian sejajar, tiga kartu rangkuman, dan gabungan penjumlahan serta pengurangan.",
    steps: [
      {
        alt: "Baris penjumlahan: batang seperempat ditambah batang dua perempat menghasilkan batang tiga perempat, dipisahkan tanda tambah dan sama dengan.",
        draw(c) {
          fractionBar(c, 60, 240, 200, 120, 4, 1);
          plusSign(c, 300, 300, 20, 8, colors.navy);
          fractionBar(c, 340, 240, 200, 120, 4, 2, colors.blue);
          equalsSign(c, 580, 300, 20, 8, colors.navy);
          fractionBar(c, 620, 240, 160, 120, 4, 3, colors.green);
        }
      },
      {
        alt: "Baris pengurangan: batang tiga perempat dikurangi batang seperempat menghasilkan batang dua perempat.",
        draw(c) {
          fractionBar(c, 60, 240, 200, 120, 4, 3);
          minusSign(c, 300, 300, 20, 8, colors.navy);
          fractionBar(c, 340, 240, 200, 120, 4, 1, colors.blue);
          equalsSign(c, 580, 300, 20, 8, colors.navy);
          fractionBar(c, 620, 240, 160, 120, 4, 2, colors.green);
        }
      },
      {
        alt: "Tiga batang bertumpuk masing-masing terbagi empat; garis putus-putus tegak menghubungkan pembagian yang tetap sejajar, dengan tanda tambah dan sama dengan di kanan.",
        draw(c) {
          fractionBar(c, 120, 110, 520, 90, 4, 1);
          fractionBar(c, 120, 250, 520, 90, 4, 2, colors.blue);
          fractionBar(c, 120, 410, 520, 90, 4, 3, colors.green);
          for (let i = 1; i < 4; i += 1) {
            dashedLine(c, 120 + i * 130, 110, 120 + i * 130, 500, 3, colors.orange, 9, 7);
          }
          plusSign(c, 700, 205, 18, 7, colors.navy);
          equalsSign(c, 700, 365, 18, 7, colors.navy);
        }
      },
      {
        alt: "Tiga kartu rangkuman berisi batang seperempat, dua perempat, dan tiga perempat.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => fractionBar(h, cx - 84, cy - 26, 168, 52, 4, 1),
            (h, cx, cy) => fractionBar(h, cx - 84, cy - 26, 168, 52, 4, 2, colors.blue),
            (h, cx, cy) => fractionBar(h, cx - 84, cy - 26, 168, 52, 4, 3, colors.green)
          ]);
        }
      },
      {
        alt: "Baris atas: seperempat ditambah dua perempat menjadi tiga perempat. Baris bawah: tiga perempat dikurangi seperempat menjadi dua perempat.",
        draw(c) {
          fractionBar(c, 70, 120, 140, 70, 4, 1);
          plusSign(c, 250, 155, 18, 7, colors.navy);
          fractionBar(c, 290, 120, 140, 70, 4, 2, colors.blue);
          equalsSign(c, 470, 155, 18, 7, colors.navy);
          fractionBar(c, 510, 120, 140, 70, 4, 3, colors.green);
          fractionBar(c, 70, 330, 140, 70, 4, 3);
          minusSign(c, 250, 365, 18, 7, colors.navy);
          fractionBar(c, 290, 330, 140, 70, 4, 1, colors.blue);
          equalsSign(c, 470, 365, 18, 7, colors.navy);
          fractionBar(c, 510, 330, 140, 70, 4, 2, colors.green);
          strokeLine(c, 60, 250, 740, 250, 3, colors.muted);
        }
      }
    ]
  },
  {
    packageDir: "kelas5-matematika-b03-faktor-kelipatan",
    base: "aktivitas-faktor-kelipatan-kpk",
    summaryAlt: "Lima ilustrasi faktor dan kelipatan: busur pasangan faktor dua belas, garis bilangan kelipatan empat, dua garis bilangan dengan penanda kelipatan persekutuan, tiga kartu rangkuman, dan dua lingkaran kelipatan yang beririsan.",
    steps: [
      {
        alt: "Garis dua belas titik dengan tiga busur berwarna menghubungkan pasangan faktor satu dan dua belas, dua dan enam, serta tiga dan empat; titik pertama dan terakhir dilingkari oranye.",
        draw(c) {
          factorArcs(c, 100, 350, 600, 12, [
            [1, 12],
            [2, 6],
            [3, 4]
          ]);
          ring(c, 100, 350, 22, 4, colors.orange);
          ring(c, 700, 350, 22, 4, colors.orange);
        }
      },
      {
        alt: "Garis bilangan dua puluh empat dengan titik teal pada setiap kelipatan empat; titik kelipatan dua puluh empat ditandai lingkaran oranye.",
        draw(c) {
          numberLine(c, 80, 330, 640, 24);
          for (let i = 4; i <= 24; i += 4) fillCircle(c, 80 + (640 * i) / 24, 330, 9, colors.teal);
          ring(c, 80 + (640 * 24) / 24, 330, 22, 5, colors.orange);
        }
      },
      {
        alt: "Dua garis bilangan bertumpuk: kelipatan empat bertitik teal dan kelipatan enam bertitik biru; batang oranye tegak menandai bilangan dua belas.",
        draw(c) {
          numberLine(c, 80, 220, 640, 24);
          for (let i = 4; i <= 24; i += 4) fillCircle(c, 80 + (640 * i) / 24, 220, 8, colors.teal);
          numberLine(c, 80, 400, 640, 24);
          for (let i = 6; i <= 24; i += 6) fillCircle(c, 80 + (640 * i) / 24, 400, 8, colors.blue);
          const x = 80 + (640 * 12) / 24;
          strokeRect(c, x - 12, 196, 24, 228, 5, colors.orange);
          ringAround(c, x, 500, 42, 4, colors.orange);
          fillCircle(c, x, 500, 10, colors.orange);
        }
      },
      {
        alt: "Tiga kartu rangkuman: busur pasangan faktor, garis bilangan bertitik kelipatan empat, dan dua langkah berpanah dengan tanda centang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniFactorArc(h, cx, cy),
            (h, cx, cy) =>
              miniNumberLine(h, cx, cy, [
                [4, colors.teal],
                [8, colors.teal],
                [12, colors.orange]
              ]),
            (h, cx, cy) => miniCheckLoop(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Dua lingkaran beririsan berisi kelipatan empat di kiri dan kelipatan enam di kanan; dua titik di daerah irisan berwarna oranye menandai kelipatan persekutuan.",
        draw(c) {
          multipleVenn(c);
        }
      }
    ]
  },
  {
    packageDir: "kelas5-matematika-b04-pengukuran-sudut",
    base: "aktivitas-pengukuran-sudut",
    summaryAlt: "Lima ilustrasi pengukuran sudut: sudut siku-siku biru bertanda kotak, sudut lancip teal, sudut tumpul oranye, tiga kartu sudut rangkuman, dan busur derajat bersama tiga sudut.",
    steps: [
      {
        alt: "Sudut siku-siku teal dengan lengan lebih panjang, tanda kotak di titik sudut, dan busur penanda sudut.",
        draw(c) {
          angleFigure(c, 400, 300, 90, colors.teal, 150);
          strokeRect(c, 400, 264, 36, 36, 4, colors.navy);
        }
      },
      {
        alt: "Sudut lancip teal yang lebih sempit daripada sudut siku-siku, dengan busur penanda sudut.",
        draw(c) {
          angleFigure(c, 400, 320, 40, colors.teal, 140);
        }
      },
      {
        alt: "Sudut tumpul oranye yang lebih lebar daripada sudut siku-siku, dengan busur penanda sudut.",
        draw(c) {
          angleFigure(c, 400, 330, 130, colors.orange, 130);
        }
      },
      {
        alt: "Tiga kartu rangkuman berisi sudut siku-siku, sudut lancip, dan sudut tumpul.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniAngle(h, cx, cy, 90),
            (h, cx, cy) => miniAngle(h, cx, cy, 40),
            (h, cx, cy) => miniAngle(h, cx, cy, 130)
          ]);
        }
      },
      {
        alt: "Busur derajat setengah lingkaran dengan garis skala, dan tiga sudut: siku-siku, lancip, dan tumpul.",
        draw(c) {
          ringSegment(c, 400, 300, 150, 8, 180, 360, colors.navy);
          strokeLine(c, 250, 300, 550, 300, 5, colors.navy);
          for (let i = 0; i <= 18; i += 1) {
            const angle = (180 + i * 10) * (Math.PI / 180);
            strokeLine(
              c,
              400 + Math.cos(angle) * 150,
              300 + Math.sin(angle) * 150,
              400 + Math.cos(angle) * (i % 3 === 0 ? 120 : 136),
              300 + Math.sin(angle) * (i % 3 === 0 ? 120 : 136),
              i % 3 === 0 ? 4 : 2,
              colors.navy
            );
          }
          fillCircle(c, 400, 300, 7, colors.navy);
          angleFigure(c, 130, 560, 90, colors.blue);
          angleFigure(c, 380, 560, 35, colors.teal);
          angleFigure(c, 620, 560, 130, colors.orange);
        }
      }
    ]
  },
  {
    packageDir: "kelas5-matematika-b05-bangun-ruang",
    base: "aktivitas-bangun-ruang",
    summaryAlt: "Lima ilustrasi bangun ruang: kubus tabung dan kerucut, kubus dengan rusuk tersembunyi, kaleng dan gelas berbentuk tabung, tiga kartu rangkuman, dan gabungan kubus tabung serta kerucut.",
    steps: [
      {
        alt: "Kubus, tabung, dan kerucut digambar tiga dimensi.",
        draw(c) {
          cube3d(c, 100, 220, 200, 46);
          cylinder3d(c, 462, 170, 420, 78);
          fillPolygon(c, [[620, 420], [700, 140], [780, 420]], colors.tealLight);
          ellipseOutline(c, 700, 420, 80, 24, 5, colors.navy);
          strokeLine(c, 700, 140, 620, 420, 5, colors.navy);
          strokeLine(c, 700, 140, 780, 420, 5, colors.navy);
        }
      },
      {
        alt: "Kubus tiga dimensi dengan sisi depan disorot oranye dan rusuk bagian belakang digambar putus-putus.",
        draw(c) {
          cube3d(c, 180, 240, 260, 70);
          strokeRect(c, 180, 240, 260, 260, 6, colors.orange);
          const hidden = [250, 500];
          dashedLine(c, 180, 500, hidden[0], hidden[1] - 70, 4, colors.muted, 10, 8);
          dashedLine(c, hidden[0], 170, hidden[0], hidden[1] - 70, 4, colors.muted, 10, 8);
          dashedLine(c, hidden[0], hidden[1] - 70, 510, hidden[1] - 70, 4, colors.muted, 10, 8);
        }
      },
      {
        alt: "Tabung besar berbentuk kaleng dan gelas kaca berisi air, keduanya berdiri tiga dimensi.",
        draw(c) {
          cylinder3d(c, 240, 140, 500, 120);
          strokeLine(c, 120, 250, 360, 250, 4, colors.blue);
          strokeLine(c, 120, 370, 360, 370, 4, colors.blue);
          glass(c, 580, 160, 500, 95, 0.7);
        }
      },
      {
        alt: "Tiga kartu rangkuman: kubus, tabung, dan kerucut tiga dimensi.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniCube(h, cx, cy),
            (h, cx, cy) => miniCylinder(h, cx, cy),
            (h, cx, cy) => miniCone(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Kubus, tabung, dan kerucut tiga dimensi; titik sudut kubus, tepi tabung, dan puncak kerucut ditandai oranye.",
        draw(c) {
          cube3d(c, 90, 220, 190, 45);
          for (const [x, y] of [
            [90, 220],
            [280, 220],
            [90, 410],
            [280, 410],
            [135, 175],
            [325, 175],
            [325, 365],
            [135, 410]
          ]) {
            fillCircle(c, x, y, 8, colors.orange);
          }
          cylinder3d(c, 450, 170, 410, 75);
          ellipseOutline(c, 450, 170, 75, 23, 7, colors.orange);
          ellipseOutline(c, 450, 410, 75, 23, 7, colors.orange);
          fillPolygon(c, [[640, 410], [700, 150], [760, 410]], colors.tealLight);
          strokeLine(c, 700, 150, 640, 410, 5, colors.navy);
          strokeLine(c, 700, 150, 760, 410, 5, colors.navy);
          ellipseOutline(c, 700, 410, 60, 18, 7, colors.orange);
          fillCircle(c, 700, 150, 9, colors.orange);
        }
      }
    ]
  },
  {
    packageDir: "kelas5-matematika-b06-volume-luas-permukaan",
    base: "aktivitas-volume-luas-permukaan",
    summaryAlt: "Lima ilustrasi volume dan luas permukaan: kubus berpetak tiga kali dua, kubus tersusun tiga kubus kecil, jaring-jaring enam persegi, tiga kartu rangkuman, dan gabungan kubus berpetak dengan jaring-jaring.",
    steps: [
      {
        alt: "Balok tiga dimensi dengan sisi depan terbagi tiga kolom dua baris dan sisi samping terbagi dua lapis.",
        draw(c) {
          cube3d(c, 140, 260, 300, 90);
          for (let i = 1; i < 3; i += 1) strokeLine(c, 140 + (300 * i) / 3, 260, 140 + (300 * i) / 3, 560, 3, colors.navy);
          for (let i = 1; i < 2; i += 1) strokeLine(c, 140, 260 + (300 * i) / 2, 440, 260 + (300 * i) / 2, 3, colors.navy);
          strokeLine(c, 440, 260, 530, 170, 3, colors.navy);
          strokeLine(c, 440, 410, 530, 320, 3, colors.navy);
          strokeLine(c, 440, 560, 530, 470, 3, colors.navy);
        }
      },
      {
        alt: "Kubus tiga dimensi terbagi tiga pada setiap rusuk; satu kubus kecil di sudut depan disorot oranye.",
        draw(c) {
          cube3d(c, 220, 220, 300, 80);
          for (let i = 1; i < 3; i += 1) {
            strokeLine(c, 220 + (300 * i) / 3, 220, 220 + (300 * i) / 3, 520, 3, colors.navy);
            strokeLine(c, 220, 220 + (300 * i) / 3, 520, 220 + (300 * i) / 3, 3, colors.navy);
          }
          fillRect(c, 220, 420, 100, 100, colors.orangeLight);
          strokeRect(c, 220, 420, 100, 100, 4, colors.orange);
        }
      },
      {
        alt: "Jaring-jaring enam persegi tersusun seperti huruf T: tiga persegi sebaris dan tiga persegi di bawah persegi tengah.",
        draw(c) {
          const cell = 96;
          const layout = [
            [300, 80],
            [404, 80],
            [508, 80],
            [404, 184],
            [404, 288],
            [404, 392]
          ];
          for (const [x, y] of layout) {
            fillRect(c, x, y, cell, cell, colors.tealLight);
            strokeRect(c, x, y, cell, cell, 4, colors.navy);
          }
        }
      },
      {
        alt: "Tiga kartu rangkuman: kubus tiga dimensi, jaring-jaring enam persegi, dan petak empat kali empat dengan sembilan kotak diwarnai.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniCube(h, cx, cy),
            (h, cx, cy) => miniNet(h, cx, cy),
            (h, cx, cy) => miniAreaGrid(h, cx, cy, 4, 4, 9)
          ]);
        }
      },
      {
        alt: "Kubus tiga dimensi dengan petak tiga kali dua di sisi depan, dan jaring-jaring enam persegi tersusun seperti huruf T.",
        draw(c) {
          cube3d(c, 80, 220, 220, 50);
          for (let i = 1; i < 3; i += 1) strokeLine(c, 80 + (220 * i) / 3, 220, 80 + (220 * i) / 3, 440, 3, colors.navy);
          for (let i = 1; i < 2; i += 1) strokeLine(c, 80, 220 + (220 * i) / 2, 300, 220 + (220 * i) / 2, 3, colors.navy);
          const cell = 70;
          const layout = [
            [470, 120],
            [540, 120],
            [610, 120],
            [540, 190],
            [540, 260],
            [540, 330]
          ];
          for (const [x, y] of layout) {
            fillRect(c, x, y, cell, cell, colors.tealLight);
            strokeRect(c, x, y, cell, cell, 4, colors.navy);
          }
        }
      }
    ]
  },
  {
    packageDir: "kelas5-matematika-b07-data",
    base: "aktivitas-data-kelas5",
    summaryAlt: "Lima ilustrasi data kelas 5: diagram batang lima batang, diagram batang dengan garis rata-rata, batang tertinggi disorot, tiga kartu rangkuman, dan diagram batang dengan garis rata-rata.",
    steps: [
      {
        alt: "Diagram batang lima batang dengan tinggi berbeda di atas sumbu mendatar dan tegak.",
        draw(c) {
          barChart(c, 90, 100, 620, 390, [4, 6, 8, 5, 7]);
        }
      },
      {
        alt: "Diagram batang lima batang dengan garis putus-putus merah mendatar pada tinggi rata-rata.",
        draw(c) {
          barChart(c, 90, 100, 620, 390, [4, 6, 8, 5, 7], { mean: 6 });
        }
      },
      {
        alt: "Diagram batang lima batang dengan batang tertinggi berwarna oranye dan kaca pembesar di dekatnya.",
        draw(c) {
          barChart(c, 90, 100, 620, 390, [4, 6, 8, 5, 7], { highlight: 2, mean: 6 });
          magnifier(c, 650, 140, 54);
        }
      },
      {
        alt: "Tiga kartu rangkuman: diagram batang dengan garis rata-rata, tabel kecil, dan dua langkah berpanah dengan tanda centang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniBarChart(h, cx, cy, [4, 6, 8, 5], -1, 6),
            (h, cx, cy) => miniTable(h, cx, cy),
            (h, cx, cy) => miniCheckLoop(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Diagram batang lima batang dengan garis rata-rata mendatar putus-putus di atasnya.",
        draw(c) {
          barChart(c, 90, 90, 620, 400, [4, 6, 8, 5, 7], { highlight: 2, mean: 6 });
        }
      }
    ]
  },
  {
    packageDir: "kelas5-matematika-b08-pemecahan-masalah",
    base: "aktivitas-pemecahan-masalah-kelas5",
    summaryAlt: "Lima ilustrasi pemecahan masalah kelas 5: kartu cerita dengan kaca pembesar, empat ubin operasi, tanda centang memeriksa ulang, empat langkah dengan langkah pertama disorot, dan empat langkah dengan panah kembali.",
    steps: [
      {
        alt: "Kartu cerita bergaris putus-putus dengan kaca pembesar di sudutnya.",
        draw(c) {
          note(c, 220, 190, 320, 200);
          magnifier(c, 610, 220, 62);
        }
      },
      {
        alt: "Empat ubin operasi berjajar: tanda tambah, kurang, kali, dan bagi.",
        draw(c) {
          operationTile(c, 160, 300, 120, "plus");
          operationTile(c, 320, 300, 120, "minus");
          operationTile(c, 480, 300, 120, "times");
          operationTile(c, 640, 300, 120, "divide");
        }
      },
      {
        alt: "Tanda centang hijau besar dengan panah melengkung kembali ke kiri sebagai tanda memeriksa ulang.",
        draw(c) {
          checkMark(c, 400, 280, 140, 12, colors.green);
          curveArrow(c, 640, 460, 200, 460, 70, 6, colors.teal);
        }
      },
      {
        alt: "Empat lingkaran langkah berjajar dengan panah; lingkaran pertama berwarna oranye lebih tebal sebagai langkah pertama.",
        draw(c) {
          flowStep(c, 150, 300, 62, 1, true);
          flowStep(c, 330, 300, 62, 2);
          flowStep(c, 510, 300, 62, 3);
          flowStep(c, 670, 300, 62, 4);
          arrow(c, 220, 300, 260, 300, 6, colors.navy);
          arrow(c, 400, 300, 440, 300, 6, colors.navy);
          arrow(c, 580, 300, 600, 300, 6, colors.navy);
        }
      },
      {
        alt: "Empat langkah berjajar dengan panah maju dan satu panah melengkung kembali ke langkah pertama.",
        draw(c) {
          flowStep(c, 130, 240, 62, 1);
          flowStep(c, 330, 240, 62, 2);
          flowStep(c, 530, 240, 62, 3);
          flowStep(c, 700, 240, 62, 4);
          arrow(c, 200, 240, 260, 240, 6, colors.navy);
          arrow(c, 400, 240, 460, 240, 6, colors.navy);
          arrow(c, 600, 240, 632, 240, 6, colors.navy);
          curveArrow(c, 700, 330, 130, 330, 80, 6, colors.teal);
          strokeLine(c, 60, 430, 740, 430, 3, colors.muted);
          books(c, 160, 540, 3);
          note(c, 440, 460, 260, 84);
        }
      }
    ]
  }
];
