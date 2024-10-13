import { HttpParams } from '@angular/common/http';
import { AbstractControl } from '@angular/forms';
import { KeyValuePair } from '../models/key-value-pair';

export function removeArrayItem<T>(array: T[], condition?: (x: T) => boolean) {
  const index = array.findIndex((x) => condition(x));
  if (index > -1) {
    array.splice(index, 1);
  }
}

export function getEnumKeys<T>(source: T): KeyValuePair[] {
  return Object.keys(source)
    .filter((x) => !isNaN(Number(x)))
    .map((x, index) => {
      const pair = new KeyValuePair();

      pair.key = index;
      pair.value = source[x].replace('_', ' ');

      return pair;
    });
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function trimStringKeys<T>(source: T) {
  if (!source) {
    return;
  }

  Object.keys(source)
    .filter((key) => typeof source[key] == 'string')
    .forEach((key) => (source[key] = source[key].trim()));
}

export function setParams(
  params: HttpParams,
  param: string,
  value: any,
  ignoreNull: boolean = false
): HttpParams {
  if (!ignoreNull && value) {
    return params.set(param, value.toString());
  }
  return params;
}

export function setArrayParams(
  params: HttpParams,
  param: string,
  values: string[]
): HttpParams {
  if (values && values.length) {
    let resultParams = params;
    values.forEach((x) => (resultParams = resultParams.append(param, x)));
    return resultParams;
  }

  return params;
}

export function setFormDateValue(
  formControl: AbstractControl,
  newValue: Date,
  defaultValue?: Date
) {
  if (!!newValue) {
    formControl.setValue(new Date(newValue));
  } else if (!!defaultValue) {
    formControl.setValue(defaultValue);
  }
}

export function setFormValue(formControl: AbstractControl, newValue: any) {
  if (!!newValue) {
    formControl.setValue(newValue);
  }
}

export function toISOString(source: Date) {
  return source ? new Date(source).toISOString() : null;
}

export function minutesToHHMM(minutes) {
  let hours = Math.floor(minutes / 60);
  let remainingMinutes = minutes % 60;

  // Ensure the format is hh:mm
  return (
    String(hours).padStart(2, '0') +
    ':' +
    String(remainingMinutes).padStart(2, '0')
  );
}

export function HHMMToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}
