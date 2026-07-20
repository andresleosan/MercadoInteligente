## Task 10: Smoke test manual + build final + deploy

**Files:** ninguno (verificaciÃ³n manual)

- [ ] **Step 1: Correr todos los tests**

Run: `npx vitest run`
Expected: PASS â€” todos los archivos de test.

- [ ] **Step 2: Build de producciÃ³n**

Run: `npm run build`
Expected: PASS. Verificar que `dist/tessdata/*.traineddata.gz` exista.

- [ ] **Step 3: Smoke test local**

Run: `npm run dev`
Verificar manualmente en el navegador:
1. Login.
2. Ir a "Registrar compra".
3. Click "Registrar por foto".
4. Subir una foto de un ticket real.
5. Esperar OCR (2-5s).
6. Ver productos parseados en pantalla de revisiÃ³n.
7. Editar uno, eliminar otro, agregar uno manual.
8. Guardar compra.
9. Verificar que aparece en Dashboard y PurchaseHistory.

- [ ] **Step 4: Deploy a Cloudflare Pages**

Push a `master`:
```bash
git push origin master
```
Cloudflare Pages auto-deploya. Verificar en el dashboard de Cloudflare que el build pasa y el deploy queda en producciÃ³n.

- [ ] **Step 5: Verificar en producciÃ³n**

Abrir la URL de Cloudflare Pages. Repetir el smoke test del Step 3 en producciÃ³n. Reportar cualquier diferencia.

- [ ] **Step 6: Actualizar `tasks-v2.md`**

Marcar las tareas 2.1-2.6 de la Fase 2 como `aprobada`:

```md
### Fase 2 â€” OCR por Foto
| # | Tarea | TitÃ¡n | Estado |
|---|---|---|---|
| 2.1 | Instalar y configurar Tesseract.js | Atlas | aprobada |
| 2.2 | Crear servicio de OCR (`src/services/ocr.ts`) | Prometeo | aprobada |
| 2.3 | Crear componente de captura de foto (cÃ¡mara o galerÃ­a) | Hefesto | aprobada |
| 2.4 | Procesar imagen y extraer productos/precios | Prometeo | aprobada |
| 2.5 | Mostrar resultados y permitir ediciÃ³n antes de guardar | Hefesto | aprobada |
| 2.6 | Tests de OCR | Temis | aprobada |
```

- [ ] **Step 7: Commit final**

```bash
git add tasks-v2.md
git commit -m "docs: Fase 2 OCR aprobada y desplegada"
git push origin master
```
