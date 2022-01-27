/**
 * 将对象属性根据指定顺序或者按ASCII码点升序进行排列
 * @param obj
 * @param keyOrder
 * @returns
 */
export default function sortObject(obj: Record<string, object>, keyOrder?: string[]): Record<string, any> {
  const res: Record<string, any> = {};

  if (keyOrder) {
    keyOrder.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        res[key] = obj[key];
        delete obj[key];
      }
    });
  }

  const keys = Object.keys(obj);

  keys.sort();
  keys.forEach(key => {
    res[key] = obj[key];
  });

  return res;
}
