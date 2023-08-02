import { ethereum } from "@graphprotocol/graph-ts";

// have to use class in graph
class DateStrings {
    dateStr: string;
    monthStr: string;

    constructor(dateStr: string, monthStr: string) {
        this.dateStr = dateStr;
        this.monthStr = monthStr;
    }
}

export function getDateFromEvent(event: ethereum.Event): DateStrings {
  let date = new Date(event.block.timestamp.toI64() * 1000); // to milliseconds
  let y = date.getUTCFullYear().toString();
  let m = (date.getUTCMonth() + 1).toString();
  m = m.length < 2? '0' + m : m;
  let d = date.getUTCDate().toString();
  d = d.length < 2? '0' + d : d;

  let dateStr = y + '/' + m + '/' + d;
  let monthStr = y + '/' + m;
  return new DateStrings(
    dateStr, 
    monthStr,
  );
}