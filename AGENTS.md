
# Repository Instructions for Coding Agents

## Mission

Bangun MVP hackathon melalui vertical slice yang kecil, stabil, dapat diuji, dan dapat didemokan. Optimalkan waktu menuju working product tanpa mengorbankan validasi server, authorization, atau integritas data.

## Read First

Sebelum mengubah kode:

1. Baca `README.md` dan `DEVELOPMENT.md`.
2. Periksa `package.json`, konfigurasi TypeScript/lint/test, `.env.example`, Prisma schema, auth configuration, dan struktur route.
3. Cari implementasi terkait sebelum menyimpulkan bahwa fitur belum ada.
4. Jelaskan flow eksisting dan rencana kecil sebelum implementasi.

Instruksi `AGENTS.md` yang lebih dekat dengan file target, jika nanti ditambahkan, berlaku untuk subtree tersebut.

## Architecture

- Gunakan Next.js App Router sebagai aplikasi full-stack.
- Gunakan TypeScript strict.
- Tempatkan business logic pada service atau fungsi domain yang dapat diuji.
- Route Handler dan Server Action menangani authentication, authorization, validation boundary, dan pemanggilan service.
- Gunakan Prisma sebagai satu-satunya akses database kecuali ada pengecualian yang terdokumentasi.
- Gunakan Zod pada seluruh input yang tidak dipercaya.
- Gunakan server-side authorization untuk role dan ownership.
- Hindari backend Express terpisah, microservice, global state manager, atau abstraction baru tanpa kebutuhan yang terbukti.

## UI Rules

- Ikuti design tokens yang didefinisikan pada project CSS.
- Font utama Plus Jakarta Sans.
- Teal adalah warna aksi utama; hijau hanya sebagai aksen.
- Gunakan komponen shadcn/ui dan Lucide yang sudah tersedia sebelum membuat primitive baru.
- Sediakan loading, empty, success, validation error, forbidden, dan unexpected error state jika relevan.
- Pertahankan aksesibilitas dasar: label, keyboard navigation, focus state, semantic elements, dan kontras.
- Pastikan perubahan dapat digunakan pada mobile dan desktop.

## Database and Auth Safety

- Jangan menjalankan database reset, truncate, destructive SQL, atau menghapus migration/data.
- Jangan memakai `prisma db push` untuk menghindari pembuatan migration.
- Jelaskan perubahan schema dan dampaknya sebelum membuat migration.
- Gunakan migration bernama deskriptif dan periksa SQL yang dihasilkan.
- Gunakan transaction untuk operasi multi-record yang harus atomic.
- Jangan menyimpan atau menampilkan plaintext password, token, secret, atau `passwordHash`.
- Jangan mempercayai role, user ID, ownership, harga, atau status dari client.
- Jangan mengandalkan UI guard sebagai authorization.
- Jangan menjalankan integration test destruktif terhadap database development atau production.

## Scope Control

- Kerjakan hanya task aktif dan perubahan pendukung yang langsung diperlukan.
- Jangan melakukan refactor repository-wide ketika perubahan lokal cukup.
- Jangan mengganti library, framework, auth strategy, ORM, atau deployment architecture tanpa permintaan eksplisit.
- Jangan menambahkan dependency jika fitur dapat dibuat dengan dependency yang sudah ada.
- Jangan mengubah business flow berdasarkan tebakan. Jika keputusan tersebut material, minta klarifikasi.
- Pertahankan perubahan user yang tidak terkait dan jangan menimpanya.

## Git Policy

Jangan menjalankan operasi Git yang mengubah state atau remote, termasuk:

- `git init`
- `git add`
- `git commit`
- `git push`
- `git checkout`
- `git switch`
- `git reset`
- `git rebase`
- membuat branch atau pull request

Perintah read-only seperti `git status` atau `git diff` boleh digunakan jika repository Git tersedia dan relevan.

## Implementation Loop

1. Inspect relevant UI, route/action, service, schema, and tests.
2. State current behavior and target outcome.
3. Create a bounded plan.
4. Implement the smallest complete vertical slice.
5. Add or update tests.
6. Run targeted checks first, then broader verification proportional to risk.
7. Verify UI/request/database behavior when tools permit.
8. Report outcome, evidence, and remaining risks.

## Testing Requirements

Minimum relevant scenarios:

- Happy path
- Invalid or missing input
- Unauthenticated access
- Unauthorized role or ownership
- Not found
- Duplicate or repeated submission
- Business rule violation
- Rollback/atomicity for critical multi-record operations

For bug fixes:

1. Reproduce the bug.
2. Identify root cause with evidence.
3. Add a regression test that represents the failure.
4. Apply the smallest root-cause fix.
5. Run the regression test and related suite.

Preferred verification commands:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Do not state that a command passed unless it was actually executed. Use `NOT RUN` when environment or scope prevents execution.

## Completion Report

End each implementation task with:

- Outcome delivered
- Files changed
- Business rules enforced
- Commands/tests run with PASS, FAIL, or NOT RUN
- Manual verification completed
- Known risks or follow-up work

## Parallel Feature Development

Development dibagi berdasarkan feature boundary.

Setiap agent hanya boleh mengubah folder feature yang ditugaskan beserta test
dan dokumen kontraknya. Jangan mengubah file shared tanpa persetujuan integration
owner.

Sebelum implementasi, setiap feature wajib mendefinisikan:

1. Outcome pengguna.
2. Input dan output module.
3. Business rule.
4. Status yang boleh diterima dan dihasilkan.
5. Database requirement.
6. Hardware atau external dependency.
7. Error scenario.
8. Test scenario.

Gunakan struktur:

```text
features/<feature>/
- components
- actions
- services
- adapters
- schemas
- types
- tests
- index.ts
```

Business logic tidak boleh ditempatkan di `page.tsx`.

Interaksi antar-feature harus melalui public export pada `index.ts`. Jangan
melakukan deep import terhadap internal file feature lain.

Gunakan interface untuk seluruh perangkat:

- `ScaleAdapter`
- `CameraAdapter`
- `FingerprintAdapter`
- `FaceRecognitionAdapter`
- `CommodityVisionAdapter`
- `MarketPriceAdapter`

Sediakan mock adapter untuk development dan automated testing. Mock hanya
digunakan selama development/test; demonstrasi final harus memakai real adapter
untuk komponen yang ditetapkan sebagai real MVP.

Jangan mengubah `package.json`, `package-lock.json`, Prisma schema, global CSS,
root layout, shared UI, database client, atau route orchestration tanpa
koordinasi integration owner.

Jangan membuat migration secara paralel. Tuliskan database requirement pada
`docs/contracts/<feature>.md`. Integration owner bertanggung jawab menggabungkan
schema dan migration.

Setelah implementasi, laporkan:

- Module contract
- Files changed
- Business rules
- Tests run
- Hardware integration status
- Mock/real adapter status
- Known integration risks

Jangan menjalankan operasi Git.
