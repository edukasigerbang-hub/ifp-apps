import {
  arrow,
  colors,
  dashedLine,
  equalsSign,
  fillCircle,
  fillRect,
  ring,
  strokeLine,
  strokeRect
} from "../illustrationKit.mjs";
import {
  angleFigure,
  apple,
  balanceScale,
  barChart,
  books,
  bodyScale,
  chevron,
  clockFace,
  coin,
  comparePanels,
  curveArrow,
  dotRow,
  drawShape,
  equalSideMarks,
  factorArcs,
  flowStep,
  fractionBar,
  glass,
  miniBarChart,
  miniCheckLoop,
  miniClock,
  miniFactorArc,
  miniPerimeterRect,
  miniScale,
  miniShapes,
  miniStoryCard,
  miniTable,
  miniTiles,
  miniVenn,
  note,
  operationTile,
  panel,
  placeValueBoard,
  rightAngleMarks,
  ringAround,
  ruler,
  summaryTrio,
  tableGrid,
  tapeMeasure,
  vennFactors
} from "../activityScenes.mjs";

export const PLAN = [
  {
    packageDir: "kelas4-matematika-b01-bilangan-cacah",
    base: "aktivitas-bilangan-cacah",
    summaryAlt: "Lima ilustrasi bilangan cacah: papan nilai tempat lima kolom, kolom ratusan disorot, kolom puluhan disorot, dua papan pembanding, dan tiga papan urutan dengan tanda panah.",
    steps: [
      {
        alt: "Papan nilai tempat lima kolom berisi satu kubus puluh ribuan, dua kubus ribuan, tiga ratusan, empat batang puluhan, dan lima satuan.",
        draw(c) {
          placeValueBoard(c, 40, 90, 720, 440, [
            { kind: "cube", count: 1 },
            { kind: "cube", count: 2 },
            { kind: "flat", count: 3 },
            { kind: "rod", count: 4 },
            { kind: "unit", count: 5 }
          ]);
        }
      },
      {
        alt: "Papan nilai tempat lima kolom dengan kolom ratusan berisi tiga ratusan disorot oranye.",
        draw(c) {
          placeValueBoard(c, 40, 90, 720, 440, [
            { kind: "cube", count: 1 },
            { kind: "cube", count: 2 },
            { kind: "flat", count: 3, highlight: true },
            { kind: "rod", count: 4 },
            { kind: "unit", count: 5 }
          ]);
        }
      },
      {
        alt: "Papan nilai tempat lima kolom dengan kolom puluhan berisi empat batang disorot oranye.",
        draw(c) {
          placeValueBoard(c, 40, 90, 720, 440, [
            { kind: "cube", count: 1 },
            { kind: "cube", count: 2 },
            { kind: "flat", count: 3 },
            { kind: "rod", count: 4, highlight: true },
            { kind: "unit", count: 5 }
          ]);
        }
      },
      {
        alt: "Dua papan nilai tempat bertumpuk; keduanya sama pada tiga kolom kiri, kolom puluhan dan satuan disorot oranye dengan jumlah berbeda.",
        draw(c) {
          placeValueBoard(c, 40, 60, 720, 220, [
            { kind: "cube", count: 1 },
            { kind: "cube", count: 2 },
            { kind: "flat", count: 3 },
            { kind: "rod", count: 4, highlight: true },
            { kind: "unit", count: 5, highlight: true }
          ]);
          placeValueBoard(c, 40, 320, 720, 220, [
            { kind: "cube", count: 1 },
            { kind: "cube", count: 2 },
            { kind: "flat", count: 3 },
            { kind: "rod", count: 5, highlight: true },
            { kind: "unit", count: 4, highlight: true }
          ]);
        }
      },
      {
        alt: "Tiga papan tiga kolom berjajar dari kiri ke kanan dengan panah di antaranya: tiga ratusan empat puluhan lima satuan, tiga ratusan lima puluhan empat satuan, dan empat ratusan tiga puluhan lima satuan.",
        draw(c) {
          const boards = [
            [
              { kind: "flat", count: 3 },
              { kind: "rod", count: 4 },
              { kind: "unit", count: 5 }
            ],
            [
              { kind: "flat", count: 3 },
              { kind: "rod", count: 5 },
              { kind: "unit", count: 4 }
            ],
            [
              { kind: "flat", count: 4 },
              { kind: "rod", count: 3 },
              { kind: "unit", count: 5 }
            ]
          ];
          boards.forEach((columns, index) => {
            const x = 10 + index * 272;
            panel(c, x, 120, 225, 380, (h, cx, cy) => {
              placeValueBoard(h, cx - 100, cy - 160, 200, 320, columns);
            });
          });
          chevron(c, 246, 310, 18, 1, colors.navy, 7);
          chevron(c, 518, 310, 18, 1, colors.navy, 7);
        }
      }
    ]
  },
  {
    packageDir: "kelas4-matematika-b02-faktor-kelipatan",
    base: "aktivitas-faktor-kelipatan",
    summaryAlt: "Lima ilustrasi faktor dan kelipatan: dua belas titik dengan busur pasangan faktor, diagram Venn faktor persekutuan, titik terbesar disorot, tiga kartu rangkuman, dan titik kelima dicoret karena bukan faktor.",
    steps: [
      {
        alt: "Garis dua belas titik dengan tiga busur berwarna menghubungkan pasangan faktor satu dan dua belas, dua dan enam, serta tiga dan empat.",
        draw(c) {
          factorArcs(c, 100, 350, 600, 12, [
            [1, 12],
            [2, 6],
            [3, 4]
          ]);
        }
      },
      {
        alt: "Diagram Venn dua lingkaran dengan dua titik biru di kiri, empat titik biru tua di daerah irisan berwarna oranye, dan dua titik merah di kanan.",
        draw(c) {
          vennFactors(c, { cx: 400, cy: 300 });
        }
      },
      {
        alt: "Diagram Venn dengan lingkaran berongga; satu titik di daerah irisan kanan bawah diperbesar dan disorot oranye.",
        draw(c) {
          vennFactors(c, { lensMode: "outline" });
          fillCircle(c, 470, 360, 26, colors.orange);
          ring(c, 470, 360, 26, 4, colors.navy);
        }
      },
      {
        alt: "Tiga kartu rangkuman: busur pasangan faktor, diagram Venn kecil, dan dua langkah berpanah dengan tanda centang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniFactorArc(h, cx, cy),
            (h, cx, cy) => miniVenn(h, cx, cy),
            (h, cx, cy) => miniCheckLoop(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Garis dua belas titik dengan busur pasangan faktor; titik kelima dicoret merah karena bukan faktor dua belas.",
        draw(c) {
          factorArcs(c, 100, 350, 600, 12, [
            [1, 12],
            [2, 6],
            [3, 4]
          ]);
          const step = 600 / 11;
          const x = 100 + 4 * step;
          dashedLine(c, x - 16, 334, x + 16, 366, 4, colors.red, 7, 5);
          dashedLine(c, x + 16, 334, x - 16, 366, 4, colors.red, 7, 5);
        }
      }
    ]
  },
  {
    packageDir: "kelas4-matematika-b03-pecahan",
    base: "aktivitas-pecahan-senilai",
    summaryAlt: "Lima ilustrasi pecahan senilai: batang terbagi dua, batang terbagi empat, batang terbagi delapan, tiga kartu batang rangkuman, dan perbandingan empat per delapan dengan satu per dua.",
    steps: [
      {
        alt: "Batang panjang terbagi dua sama besar dengan satu bagian diwarnai teal.",
        draw(c) {
          fractionBar(c, 80, 240, 640, 120, 2, 1);
        }
      },
      {
        alt: "Batang panjang terbagi empat sama besar dengan dua bagian diwarnai biru.",
        draw(c) {
          fractionBar(c, 80, 240, 640, 120, 4, 2, colors.blue);
        }
      },
      {
        alt: "Batang panjang terbagi delapan sama besar dengan empat bagian diwarnai hijau.",
        draw(c) {
          fractionBar(c, 80, 240, 640, 120, 8, 4, colors.green);
        }
      },
      {
        alt: "Tiga kartu rangkuman berisi batang terbagi dua, empat, dan delapan dengan bagian yang diwarnai setara.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => fractionBar(h, cx - 84, cy - 26, 168, 52, 2, 1),
            (h, cx, cy) => fractionBar(h, cx - 84, cy - 26, 168, 52, 4, 2, colors.blue),
            (h, cx, cy) => fractionBar(h, cx - 84, cy - 26, 168, 52, 8, 4, colors.green)
          ]);
        }
      },
      {
        alt: "Panel kiri batang delapan bagian dengan empat bagian diwarnai; panel kanan batang dua bagian dengan satu bagian diwarnai; tanda sama dengan di antaranya.",
        draw(c) {
          comparePanels(
            c,
            (h, cx, cy) => {
              fractionBar(h, cx - 130, cy - 50, 260, 100, 8, 4);
            },
            (h, cx, cy) => {
              fractionBar(h, cx - 130, cy - 50, 260, 100, 2, 1, colors.green);
            }
          );
          equalsSign(c, 400, 300, 10, 5, colors.navy);
        }
      }
    ]
  },
  {
    packageDir: "kelas4-matematika-b04-pengukuran",
    base: "aktivitas-pengukuran-panjang-berat",
    summaryAlt: "Lima ilustrasi pengukuran: pensil di atas penggaris, timbangan dengan apel dan beban, pita meter dan penggaris seratus pembagian, tiga kartu rangkuman, dan timbangan badan.",
    steps: [
      {
        alt: "Penggaris berskala dengan pensil oranye di atasnya; ujung pensil sejajar dengan awal skala.",
        draw(c) {
          ruler(c, 60, 250, 640, 80, 30);
          fillRect(c, 92, 208, 520, 30, colors.orange);
          strokeRect(c, 92, 208, 520, 30, 4, colors.navy);
        }
      },
      {
        alt: "Timbangan dua lengan dengan tiga apel di lengan kiri dan satu beban biru di lengan kanan.",
        draw(c) {
          balanceScale(c, 400, 540, 130);
          apple(c, 230, 412, 22);
          apple(c, 274, 412, 22);
          apple(c, 252, 382, 20);
          fillRect(c, 498, 386, 64, 48, colors.blueLight);
          strokeRect(c, 498, 386, 64, 48, 5, colors.navy);
        }
      },
      {
        alt: "Pita meter berwarna kuning di atas penggaris panjang dengan seratus pembagian, seluruh penggaris ditandai kotak oranye.",
        draw(c) {
          tapeMeasure(c, 80, 110, 640);
          ruler(c, 80, 300, 640, 90, 100);
          strokeRect(c, 80, 300, 640, 90, 5, colors.orange);
        }
      },
      {
        alt: "Tiga kartu rangkuman: penggaris berskala, timbangan dua lengan, dan dua langkah berpanah dengan tanda centang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniScale(h, cx, cy),
            (h, cx, cy) => miniCheckLoop(h, cx, cy),
            (h, cx, cy) => miniTable(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Timbangan badan besar dengan alas berpijak, jarum penunjuk merah, dan sosok orang berdiri di atasnya.",
        draw(c) {
          bodyScale(c, 400, 540, 1.6);
        }
      }
    ]
  },
  {
    packageDir: "kelas4-matematika-b05-bangun-datar",
    base: "aktivitas-bangun-datar-kelas4",
    summaryAlt: "Lima ilustrasi bangun datar kelas 4: empat bangun berjajar, persegi dengan tanda sisi dan sudut, persegi panjang berpanah keliling, tiga kartu rangkuman, dan persegi panjang berpetak dengan panah keliling.",
    steps: [
      {
        alt: "Empat bangun datar berjajar: lingkaran, persegi, persegi panjang, dan segitiga.",
        draw(c) {
          drawShape(c, "circle", 130, 300, 150, { fill: colors.teal });
          drawShape(c, "square", 310, 300, 160, { fill: colors.sun });
          drawShape(c, "rectangle", 490, 300, 150, { fill: colors.redLight });
          drawShape(c, "triangle", 660, 300, 160, { fill: colors.blue });
        }
      },
      {
        alt: "Persegi biru muda besar dengan tanda pendek di setiap sisi dan tanda sudut siku-siku di keempat sudutnya.",
        draw(c) {
          drawShape(c, "square", 400, 300, 300, { fill: colors.sky });
          equalSideMarks(c, 400, 300, 300);
          rightAngleMarks(c, 400, 300, 300);
        }
      },
      {
        alt: "Persegi panjang dengan panah teal di keempat sisinya; sisi mendatar lebih panjang daripada sisi tegak.",
        draw(c) {
          strokeRect(c, 160, 170, 480, 260, 8, colors.navy);
          strokeLine(c, 160, 130, 500, 130, 6, colors.teal);
          arrow(c, 440, 130, 500, 130, 6, colors.teal);
          strokeLine(c, 680, 170, 680, 400, 6, colors.teal);
          arrow(c, 680, 340, 680, 400, 6, colors.teal);
          strokeLine(c, 640, 470, 160, 470, 6, colors.teal);
          arrow(c, 240, 470, 160, 470, 6, colors.teal);
          strokeLine(c, 120, 430, 120, 170, 6, colors.teal);
          arrow(c, 120, 230, 120, 170, 6, colors.teal);
        }
      },
      {
        alt: "Tiga kartu rangkuman: bangun berjajar, persegi panjang berpanah keliling, dan petak empat kali lima dengan tujuh kotak diwarnai.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniShapes(h, cx, cy, ["square", "rectangle", "circle"]),
            (h, cx, cy) => miniPerimeterRect(h, cx, cy),
            (h, cx, cy) => miniTable(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Persegi panjang berpetak kotak satuan dengan panah mengelilingi keempat sisinya.",
        draw(c) {
          for (let row = 0; row < 4; row += 1) {
            for (let column = 0; column < 6; column += 1) {
              fillRect(c, 100 + column * 100, 160 + row * 60, 100, 60, (row + column) % 2 === 0 ? colors.pale : colors.white);
            }
          }
          for (let i = 0; i <= 6; i += 1) strokeLine(c, 100 + i * 100, 160, 100 + i * 100, 400, 3, colors.navy);
          for (let i = 0; i <= 4; i += 1) strokeLine(c, 100, 160 + i * 60, 700, 160 + i * 60, 3, colors.navy);
          strokeRect(c, 100, 160, 600, 240, 7, colors.navy);
          strokeLine(c, 100, 130, 700, 130, 5, colors.teal);
          arrow(c, 640, 130, 700, 130, 5, colors.teal);
          strokeLine(c, 730, 160, 730, 400, 5, colors.teal);
          arrow(c, 730, 340, 730, 400, 5, colors.teal);
          strokeLine(c, 700, 430, 100, 430, 5, colors.teal);
          arrow(c, 160, 430, 100, 430, 5, colors.teal);
          strokeLine(c, 70, 400, 70, 160, 5, colors.teal);
          arrow(c, 70, 220, 70, 160, 5, colors.teal);
        }
      }
    ]
  },
  {
    packageDir: "kelas4-matematika-b06-garis-sudut",
    base: "aktivitas-garis-sudut",
    summaryAlt: "Lima ilustrasi garis dan sudut: dua garis sejajar dipotong garis melintang, sudut siku-siku bertanda kotak, sudut lancip dan tumpul berjajar, tiga sudut dengan dua garis sejajar, dan busur derajat.",
    steps: [
      {
        alt: "Dua garis mendatar sejajar dan satu garis melintang teal yang memotong keduanya.",
        draw(c) {
          strokeLine(c, 180, 180, 620, 180, 7, colors.navy);
          strokeLine(c, 180, 400, 620, 400, 7, colors.navy);
          strokeLine(c, 250, 100, 480, 480, 7, colors.teal);
        }
      },
      {
        alt: "Sudut siku-siku biru dengan tanda kotak kecil di titik sudut dan busur penanda sudut.",
        draw(c) {
          angleFigure(c, 400, 300, 90, colors.blue, 130);
          strokeRect(c, 400, 272, 30, 30, 4, colors.navy);
        }
      },
      {
        alt: "Dua sudut berjajar: sudut lancip teal di kiri dan sudut tumpul oranye yang lebih lebar di kanan.",
        draw(c) {
          angleFigure(c, 240, 320, 40, colors.teal, 110);
          angleFigure(c, 570, 320, 130, colors.orange, 110);
        }
      },
      {
        alt: "Dua garis sejajar dipotong satu garis melintang di bagian atas; sudut siku-siku, sudut lancip, dan sudut tumpul berjajar di bawah.",
        draw(c) {
          strokeLine(c, 220, 150, 580, 150, 6, colors.navy);
          strokeLine(c, 220, 330, 580, 330, 6, colors.navy);
          strokeLine(c, 260, 100, 440, 380, 6, colors.teal);
          angleFigure(c, 150, 520, 90, colors.blue);
          angleFigure(c, 400, 520, 40, colors.teal);
          angleFigure(c, 650, 520, 135, colors.orange);
        }
      },
      {
        alt: "Busur derajat setengah lingkaran dengan garis skala dan satu sudut lancip teal yang diukur dari titik pusatnya.",
        draw(c) {
          ringAround(c, 400, 300, 210, 8, colors.navy);
          strokeLine(c, 190, 300, 610, 300, 6, colors.navy);
          for (let i = 0; i <= 18; i += 1) {
            const angle = (180 + i * 10) * (Math.PI / 180);
            strokeLine(
              c,
              400 + Math.cos(angle) * 210,
              300 + Math.sin(angle) * 210,
              400 + Math.cos(angle) * (i % 3 === 0 ? 170 : 190),
              300 + Math.sin(angle) * (i % 3 === 0 ? 170 : 190),
              i % 3 === 0 ? 4 : 2,
              colors.navy
            );
          }
          angleFigure(c, 400, 300, 40, colors.teal, 170);
          fillCircle(c, 400, 300, 8, colors.navy);
        }
      }
    ]
  },
  {
    packageDir: "kelas4-matematika-b07-waktu-volume-data",
    base: "aktivitas-waktu-volume-data",
    summaryAlt: "Lima ilustrasi waktu volume data: jam menunjukkan pukul tujuh lewat tiga puluh, gelas ukur berisi air, diagram batang dengan batang tertinggi disorot, tiga kartu rangkuman, dan gabungan jam gelas ukur diagram batang serta tabel.",
    steps: [
      {
        alt: "Jam dinding besar dengan jarum pendek di antara tujuh dan delapan serta jarum panjang di angka enam.",
        draw(c) {
          clockFace(c, 400, 300, 200, 7, 30);
        }
      },
      {
        alt: "Gelas ukur dengan garis skala di sisi kanan dan air terisi lebih dari separuh tinggi gelas.",
        draw(c) {
          glass(c, 400, 110, 520, 110, 0.6);
        }
      },
      {
        alt: "Diagram batang empat batang; batang kedua tertinggi berwarna oranye.",
        draw(c) {
          barChart(c, 120, 110, 560, 380, [3, 7, 5, 4], { highlight: 1 });
        }
      },
      {
        alt: "Tiga kartu rangkuman: jam dinding, gelas ukur kecil, dan diagram batang tiga batang dengan batang tertinggi ditandai.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniClock(h, cx, cy, 7, 30),
            (h, cx, cy) => {
              glass(h, cx, cy - 70, cy + 70, 60, 0.6);
            },
            (h, cx, cy) => miniBarChart(h, cx, cy, [3, 7, 5], 1)
          ]);
        }
      },
      {
        alt: "Jam dinding, gelas ukur berisi air dengan tanda skala, diagram batang empat batang, dan tabel kosong tiga kolom.",
        draw(c) {
          clockFace(c, 130, 160, 90, 10, 15);
          glass(c, 380, 90, 330, 62, 0.6);
          barChart(c, 500, 120, 260, 240, [3, 7, 5, 4], { highlight: 1 });
          strokeLine(c, 60, 380, 740, 380, 3, colors.muted);
          tableGrid(c, 70, 410, 620, 120, 3, 2);
        }
      }
    ]
  },
  {
    packageDir: "kelas4-matematika-b08-pemecahan-masalah",
    base: "aktivitas-pemecahan-masalah",
    summaryAlt: "Lima ilustrasi pemecahan masalah: tiga buku dan uang kertas, ubin kali di atas tiga kelompok titik, uang dengan koin kembalian, tiga kartu rangkuman, dan gabungan buku uang koin serta langkah penyelesaian.",
    steps: [
      {
        alt: "Tiga buku bertumpuk dan satu lembar uang kertas di sebelahnya.",
        draw(c) {
          books(c, 110, 470, 3);
          note(c, 470, 190, 240, 96);
          coin(c, 530, 400, 42, colors.sun);
        }
      },
      {
        alt: "Ubin besar bertanda kali di atas tiga kelompok berisi lima titik.",
        draw(c) {
          operationTile(c, 400, 170, 130, "times");
          for (let group = 0; group < 3; group += 1) {
            dotRow(c, 180 + group * 220, 400, 5, 30, 13, colors.teal);
          }
        }
      },
      {
        alt: "Lembar uang kertas di atas, panah ke bawah menuju tiga koin, dan panah melengkung kembali ke kiri.",
        draw(c) {
          note(c, 250, 120, 300, 100);
          arrow(c, 400, 240, 400, 300, 7, colors.navy);
          coin(c, 320, 370, 46, colors.sun);
          coin(c, 420, 370, 46, colors.sun);
          coin(c, 520, 370, 40, colors.pale);
          curveArrow(c, 520, 450, 220, 470, 40, 6, colors.teal);
        }
      },
      {
        alt: "Tiga kartu rangkuman: kartu cerita bergaris, dua ubin tanda tambah dan kurang, serta dua langkah berpanah dengan tanda centang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniStoryCard(h, cx, cy),
            (h, cx, cy) => miniTiles(h, cx, cy),
            (h, cx, cy) => miniCheckLoop(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Tiga buku bertumpuk, satu lembar uang kertas, dua koin, dan panah kembali menuju buku, menggambarkan pembelian dan kembalian.",
        draw(c) {
          note(c, 430, 110, 260, 90);
          arrow(c, 560, 212, 560, 252, 6, colors.navy);
          coin(c, 560, 300, 40, colors.sun);
          coin(c, 680, 300, 34, colors.pale);
          strokeLine(c, 60, 370, 740, 370, 3, colors.muted);
          books(c, 100, 420, 3);
          curveArrow(c, 640, 420, 330, 470, 40, 6, colors.teal);
          strokeLine(c, 60, 512, 740, 512, 3, colors.muted);
          flowStep(c, 150, 552, 34, 1);
          flowStep(c, 300, 552, 34, 2);
          flowStep(c, 450, 552, 34, 3);
        }
      }
    ]
  }
];
