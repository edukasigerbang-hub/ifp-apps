# Device Validation Plan

## 1. Baseline perangkat

-   Android minimum: Android 14.
-   Windows minimum: Windows 11.
-   RAM: minimum 8 GB.
-   Internal storage: minimum 128 GB.
-   Resolution: Full HD 1920×1080 dan 4K 3840×2160.
-   Interaction: touch-first IFP.
-   Network: online, intermittent, offline.

## 2. Status

Semua item berikut berstatus **VALIDATE** sampai dibuktikan pada
perangkat fisik. Emulator/simulator membantu development tetapi tidak
menggantikan acceptance test hardware.

## 3. Matriks uji

  ----------------------------------------------------------------------------------------------
  ID             Area           Test                          Kriteria lulus      Status
  -------------- -------------- ----------------------------- ------------------- --------------
  DV-01          Build          Build/install Android 14      Install dan launch  NOT RUN
                                                              sukses              

  DV-02          Build          Build/install Windows 11      Install dan launch  NOT RUN
                                                              sukses              

  DV-03          UI             Full HD layout                Tidak ada           NOT RUN
                                                              clipping/overflow   
                                                              pada alur inti      

  DV-04          UI             4K layout                     Scaling tajam,      NOT RUN
                                                              kontrol tetap mudah 
                                                              disentuh            

  DV-05          Touch          Gesture/tap pada IFP          Semua alur utama    NOT RUN
                                                              dapat dilakukan     
                                                              tanpa mouse         

  DV-06          Data           SQLite                        Transaksi           NOT RUN
                                create/read/write/migration   konsisten; migrasi  
                                                              teruji              

  DV-07          Files          Import content Android via    File terpilih dapat NOT RUN
                                document picker               diimpor tanpa       
                                                              arbitrary storage   
                                                              access              

  DV-08          Files          Open/import/export managed    Operasi berhasil    NOT RUN
                                folder Windows                dengan permission   
                                                              normal              

  DV-09          Content        Invalid package               Ditolak tanpa       NOT RUN
                                                              merusak konten      
                                                              aktif               

  DV-10          Content        Interrupted update            Versi aktif tetap   NOT RUN
                                                              dapat dibuka atau   
                                                              rollback berhasil   

  DV-11          Media          Image/audio/video codecs      Format yang         NOT RUN
                                                              disetujui dapat     
                                                              diputar stabil      

  DV-12          3D             WebGL/glTF sample             FPS, memory,        NOT RUN
                                                              thermal behavior    
                                                              memenuhi target     
                                                              yang ditetapkan     

  DV-13          Offline        Cold launch tanpa internet    Materi inti dan     NOT RUN
                                                              hasil lokal         
                                                              berfungsi           

  DV-14          Sync           Reconnect after offline       Tidak ada event     NOT RUN
                                events                        hilang/duplikat     

  DV-15          License        Online/offline activation     Validasi native,    NOT RUN
                                                              device binding dan  
                                                              errors benar        

  DV-16          Storage        Low disk/free space           Update gagal aman   NOT RUN
                                                              dan memberi pesan   
                                                              jelas               

  DV-17          Recovery       Force close during update     Recovery konsisten  NOT RUN
                                                              pada launch         
                                                              berikutnya          

  DV-18          Update         App update                    Data lokal dan      NOT RUN
                                                              lisensi tetap ada   

  DV-19          Security       Invalid signed                Ditolak dan tidak   NOT RUN
                                license/content               membuka entitlement 

  DV-20          Long run       Sesi belajar panjang          Tidak ada memory    NOT RUN
                                                              growth/fatal        
                                                              degradation di atas 
                                                              batas yang          
                                                              ditetapkan          
  ----------------------------------------------------------------------------------------------

## 4. Hal yang harus diukur dan belum boleh diasumsikan

-   Waktu cold start dan navigasi.
-   Waktu membuka paket besar.
-   Ukuran instalasi dan ruang bebas yang diperlukan saat update.
-   Batas ukuran paket serta file media.
-   Kinerja video dan 3D pada Full HD dan 4K.
-   Konsumsi memori dan stabilitas sesi panjang.
-   Dukungan secure storage Android dan Windows.
-   Perilaku installer/updater pada setiap arsitektur CPU yang didukung.
-   Dukungan hardware decoding dan format media.
-   Perilaku saat aplikasi dipause/resume oleh Android.

## 5. Gerbang teknis

Sebelum implementasi fitur bergantung pada platform, jalankan spike
kecil untuk: 1. Tauri 2 hello-world pada dua target. 2. SQLite
plugin/native integration dan migrasi. 3. Android document picker serta
Windows managed content folder. 4. Audio/video sample dan WebGL/glTF
sample. 5. Ed25519 verify di Rust; secure private-key storage hanya jika
diperlukan. 6. App update dengan data test untuk memastikan identitas
dan app-data bertahan.

Catat perangkat, OS build, RAM, resolusi, app version, test artifact,
hasil, dan issue. Jangan memberi status PASS tanpa evidence.
