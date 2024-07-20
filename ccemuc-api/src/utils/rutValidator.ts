/* eslint-disable no-plusplus */
function getDV(rut: string): string | false {
    let acum = 0;
    let num = 0;
    let N = 0;
  
    if (rut.length === 8) {
      for (let i = 1; i <= rut.length; i += 1) {
        num = parseInt(rut[i - 1], 10);
  
        if (i === 1) { N = 3; }
        if (i === 2) { N = 2; }
        if (i === 3) { N = 7; }
        if (i === 4) { N = 6; }
        if (i === 5) { N = 5; }
        if (i === 6) { N = 4; }
        if (i === 7) { N = 3; }
        if (i === 8) { N = 2; }
  
        num *= N;
        acum += num;
      }
    } else if (rut.length === 7) {
      for (let i = 1; i <= rut.length; i += 1) {
        num = parseInt(rut[i - 1], 10);
  
        if (i === 1) { N = 2; }
        if (i === 2) { N = 7; }
        if (i === 3) { N = 6; }
        if (i === 4) { N = 5; }
        if (i === 5) { N = 4; }
        if (i === 6) { N = 3; }
        if (i === 7) { N = 2; }
  
        num *= N;
        acum += num;
      }
    } else {
      return false;
    }
  
    const cuo = Math.floor(acum / 11);
    let expectedDV: string | number = 11 - (acum - (cuo * 11));
  
    if (expectedDV === 11) {
      expectedDV = '0';
    } else if (expectedDV === 10) {
      expectedDV = 'K';
    } else {
      expectedDV = expectedDV.toString();
    }
  
    return expectedDV;
  }
  
  export function isRut(rut: string): { status: boolean; message: string } {
    const response = {
      status: false,
      message: 'Valid RUT',
    };
  
    if (rut.includes('.')) {
      response.message = 'RUT must not contain dots Format: XX.XXX.XXX-X';
      return response;
    }
  
    if (!rut.includes('-')) {
      response.message = 'RUT must contain dashes';
      return response;
    }
  
    const rutWithoutdv = rut.split('-')[0];
    const dv = rut.split('-')[1].toUpperCase();
  
    if (!(rutWithoutdv.length >= 7 && rutWithoutdv.length <= 8)) {
      response.message = 'RUT without DV must have 9 or 10 digits';
      return response;
    }
  
    const expectedDV = getDV(rutWithoutdv);
  
    if (expectedDV !== dv) {
      response.message = `Invalid DV. Expected: ${expectedDV}`;
      console.log(`Expected: ${expectedDV} - Received: ${dv}`);
      return response;
    }
  
    response.status = true;
    return response;
  }
  
  export function getFakeRut(numberOfRuts = 1): string[] {
    const minValue = 1e6;
    const maxValue = 2.5e7;
    const ruts: string[] = [];
  
    for (let i = 0; i < numberOfRuts; i += 1) {
      const rutWithoutDV = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
  
      const dv = getDV(rutWithoutDV.toString());
  
      ruts.push(`${rutWithoutDV}-${dv}`);
    }
  
    return ruts;
  }
  