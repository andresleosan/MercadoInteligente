diff --git a/firestore.rules b/firestore.rules
index 01f9291..9cbb43a 100644
--- a/firestore.rules
+++ b/firestore.rules
@@ -28,6 +28,10 @@ service cloud.firestore {
         allow read, write: if isAuthenticated() && isOwner(userId);
       }
       
+      match /categoryMappings/{mappingId} {
+        allow read, write: if isAuthenticated() && isOwner(userId);
+      }
+      
       match /dailyBudgets/{date} {
         allow read, write: if isAuthenticated() && isOwner(userId);
       }
diff --git a/src/services/categoryMapping.ts b/src/services/categoryMapping.ts
index b8a95c2..11317ba 100644
--- a/src/services/categoryMapping.ts
+++ b/src/services/categoryMapping.ts
@@ -6,6 +6,7 @@ import {
   doc,
   query,
   where,
+  serverTimestamp,
 } from 'firebase/firestore'
 import { db } from '@/config/firebase'
 import type { CategoryMapping } from '@/types'
@@ -47,8 +48,7 @@ export async function saveCategoryMapping(
     await addDoc(mappingsRef, {
       productName: normalized,
       categoryId,
-      userId,
-      createdAt: new Date(),
+      createdAt: serverTimestamp(),
     })
   } else {
     const existingDoc = snapshot.docs[0]
diff --git a/src/tests/services/categoryMapping.test.ts b/src/tests/services/categoryMapping.test.ts
index f600762..7ab8557 100644
--- a/src/tests/services/categoryMapping.test.ts
+++ b/src/tests/services/categoryMapping.test.ts
@@ -29,6 +29,7 @@ vi.mock('firebase/firestore', () => ({
   doc: (...args: unknown[]) => mockDoc(...args),
   query: (...args: unknown[]) => mockQuery(...args),
   where: (...args: unknown[]) => mockWhere(...args),
+  serverTimestamp: () => ({ _serverTimestamp: true }),
 }))
 
 describe('categoryMapping service', () => {
@@ -87,14 +88,13 @@ describe('categoryMapping service', () => {
       mockGetDocs.mockResolvedValue({ docs: [], empty: true })
       mockAddDoc.mockResolvedValue({ id: 'new-map-id' })
 
-      await saveCategoryMapping(userId, 'Pan Franc├®s', 'panaderia')
+      await saveCategoryMapping(userId, 'Pan Frances', 'panaderia')
 
-      expect(mockWhere).toHaveBeenCalledWith('productName', '==', 'pan franc├®s')
+      expect(mockWhere).toHaveBeenCalledWith('productName', '==', 'pan frances')
       expect(mockAddDoc).toHaveBeenCalledWith('mappings-ref', {
-        productName: 'pan franc├®s',
+        productName: 'pan frances',
         categoryId: 'panaderia',
-        userId,
-        createdAt: expect.any(Date),
+        createdAt: { _serverTimestamp: true },
       })
       expect(mockUpdateDoc).not.toHaveBeenCalled()
     })
