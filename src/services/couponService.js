/**
 * Coupon Service for TaskNest
 * Admin-only coupon CRUD + user redemption.
 * Stores coupons in Firestore 'coupons' collection.
 */

import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    serverTimestamp,
    arrayUnion,
    increment,
} from 'firebase/firestore';

const COUPONS_COLLECTION = 'coupons';

/**
 * Generate a random coupon code like "PRO-A3X9K2"
 */
export function generateCouponCode(plan = 'pro') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${plan.toUpperCase()}-${code}`;
}

/**
 * Create a new coupon (admin only)
 */
export async function createCoupon({ code, plan, durationDays, maxUses }) {
    const couponRef = doc(db, COUPONS_COLLECTION, code.toUpperCase());
    await setDoc(couponRef, {
        code: code.toUpperCase(),
        plan,
        durationDays: Number(durationDays),
        maxUses: Number(maxUses),
        usedCount: 0,
        usedBy: [],
        active: true,
        createdAt: serverTimestamp(),
    });
    return { id: code.toUpperCase(), code: code.toUpperCase(), plan, durationDays, maxUses };
}

/**
 * Delete a coupon (admin only)
 */
export async function deleteCoupon(couponCode) {
    await deleteDoc(doc(db, COUPONS_COLLECTION, couponCode));
}

/**
 * Toggle coupon active/inactive (admin only)
 */
export async function toggleCoupon(couponCode, active) {
    await updateDoc(doc(db, COUPONS_COLLECTION, couponCode), { active });
}

/**
 * Get all coupons (admin only)
 */
export async function getAllCoupons() {
    const snapshot = await getDocs(collection(db, COUPONS_COLLECTION));
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()
            ? d.data().createdAt.toDate().toLocaleDateString()
            : 'Unknown',
    }));
}

/**
 * Redeem a coupon — validates and returns the plan to activate
 */
export async function redeemCoupon(code, userId) {
    const upperCode = code.trim().toUpperCase();
    const q = query(
        collection(db, COUPONS_COLLECTION),
        where('code', '==', upperCode),
        where('active', '==', true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error('Invalid or expired coupon code.');
    }

    const couponDoc = snapshot.docs[0];
    const coupon = couponDoc.data();

    if (coupon.usedCount >= coupon.maxUses) {
        throw new Error('This coupon has reached its maximum uses.');
    }

    if (coupon.usedBy?.includes(userId)) {
        throw new Error('You have already used this coupon.');
    }

    // Mark coupon as used by this user
    await updateDoc(doc(db, COUPONS_COLLECTION, couponDoc.id), {
        usedCount: increment(1),
        usedBy: arrayUnion(userId),
    });

    return {
        plan: coupon.plan,
        durationDays: coupon.durationDays,
    };
}
