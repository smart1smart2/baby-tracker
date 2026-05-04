import { VACC_AGE_SLOTS, slotForMonth } from '@/features/vaccinations/labels';

describe('slotForMonth', () => {
  test('snaps months to the nearest standard slot', () => {
    expect(slotForMonth(0).id).toBe('birth');
    expect(slotForMonth(2).id).toBe('m2');
    expect(slotForMonth(3).id).toBe('m2');
    expect(slotForMonth(5).id).toBe('m4');
    expect(slotForMonth(11).id).toBe('m6');
    expect(slotForMonth(12).id).toBe('m12');
    expect(slotForMonth(18).id).toBe('m18');
    expect(slotForMonth(99).id).toBe('m18');
  });

  test('every slot is reachable from its own boundary month', () => {
    for (const slot of VACC_AGE_SLOTS) {
      expect(slotForMonth(slot.month).id).toBe(slot.id);
    }
  });
});
