/**
 * Porter Stemming Algorithm Implementation in TypeScript
 * Based on the original paper by Martin Porter (1980)
 */

export class PorterStemmer {
  private b: string = "";
  private k: number = 0;
  private k0: number = 0;
  private j: number = 0;

  /**
   * Returns true if b[i] is a consonant.
   */
  private isConsonant(i: number): boolean {
    const char = this.b[i];
    if ("aeiou".includes(char)) return false;
    if (char === "y") {
      if (i === this.k0) return true;
      return !this.isConsonant(i - 1);
    }
    return true;
  }

  /**
   * measure() measures the number of consonant sequences between k0 and j.
   * if c is a consonant sequence and v a vowel sequence, and <..> indicates arbitrary
   * presence,
   *
   *    <c><v>       gives 0
   *    <c>vc<v>     gives 1
   *    <c>vcvc<v>   gives 2
   *    <c>vcvcvc<v> gives 3
   *    ....
   */
  private measure(): number {
    let n = 0;
    let i = this.k0;
    while (true) {
      if (i > this.j) return n;
      if (!this.isConsonant(i)) break;
      i++;
    }
    i++;
    while (true) {
      while (true) {
        if (i > this.j) return n;
        if (this.isConsonant(i)) break;
        i++;
      }
      i++;
      n++;
      while (true) {
        if (i > this.j) return n;
        if (!this.isConsonant(i)) break;
        i++;
      }
      i++;
    }
  }

  /**
   * containsVowel() is true if k0,...j contains a vowel
   */
  private containsVowel(): boolean {
    for (let i = this.k0; i <= this.j; i++) {
      if (!this.isConsonant(i)) return true;
    }
    return false;
  }

  /**
   * endsDoubleConsonant(j) is true if j,(j-1) contain a double consonant.
   */
  private endsDoubleConsonant(j: number): boolean {
    if (j < this.k0 + 1) return false;
    if (this.b[j] !== this.b[j - 1]) return false;
    return this.isConsonant(j);
  }

  /**
   * cvc(i) is true if i-2,i-1,i has the form consonant - vowel - consonant
   * and also if the second c is not w,x or y. this is used when restoring a
   * last 'e'.
   */
  private cvc(i: number): boolean {
    if (i < this.k0 + 2 || !this.isConsonant(i) || this.isConsonant(i - 1) || !this.isConsonant(i - 2)) return false;
    const char = this.b[i];
    if (char === "w" || char === "x" || char === "y") return false;
    return true;
  }

  private ends(s: string): boolean {
    const l = s.length;
    const o = this.k - l + 1;
    if (o < this.k0) return false;
    for (let i = 0; i < l; i++) {
      if (this.b[o + i] !== s[i]) return false;
    }
    this.j = this.k - l;
    return true;
  }

  private setto(s: string): void {
    const l = s.length;
    const o = this.j + 1;
    const bArr = this.b.split("");
    for (let i = 0; i < l; i++) {
      bArr[o + i] = s[i];
    }
    this.b = bArr.join("");
    this.k = this.j + l;
  }

  private r(s: string): void {
    if (this.measure() > 0) this.setto(s);
  }

  /**
   * step1ab() gets rid of plurals and -ed or -ing.
   */
  private step1ab(): void {
    if (this.b[this.k] === "s") {
      if (this.ends("sses")) this.k -= 2;
      else if (this.ends("ies")) this.setto("i");
      else if (this.b[this.k - 1] !== "s") this.k--;
    }
    if (this.ends("eed")) {
      if (this.measure() > 0) this.k--;
    } else if ((this.ends("ed") || this.ends("ing")) && this.containsVowel()) {
      this.k = this.j;
      if (this.ends("at")) this.setto("ate");
      else if (this.ends("bl")) this.setto("ble");
      else if (this.ends("iz")) this.setto("ize");
      else if (this.endsDoubleConsonant(this.k)) {
        this.k--;
        const char = this.b[this.k];
        if (char === "l" || char === "s" || char === "z") this.k++;
      } else if (this.measure() === 1 && this.cvc(this.k)) {
        this.setto("e");
      }
    }
  }

  /**
   * step1c() turns terminal y to i when there is another vowel in the stem.
   */
  private step1c(): void {
    if (this.ends("y") && this.containsVowel()) {
      const bArr = this.b.split("");
      bArr[this.k] = "i";
      this.b = bArr.join("");
    }
  }

  /**
   * step2() maps double suffices to single ones. so -ization ( = -ize plus
   * -ation) maps to -ize etc. note that the string before the suffix must give
   * m() > 0.
   */
  private step2(): void {
    switch (this.b[this.k - 1]) {
      case "a":
        if (this.ends("ational")) { this.r("ate"); break; }
        if (this.ends("tional")) { this.r("tion"); break; }
        break;
      case "c":
        if (this.ends("enci")) { this.r("ence"); break; }
        if (this.ends("anci")) { this.r("ance"); break; }
        break;
      case "e":
        if (this.ends("izer")) { this.r("ize"); break; }
        break;
      case "l":
        if (this.ends("bli")) { this.r("ble"); break; }
        if (this.ends("alli")) { this.r("al"); break; }
        if (this.ends("entli")) { this.r("ent"); break; }
        if (this.ends("eli")) { this.r("e"); break; }
        if (this.ends("ousli")) { this.r("ous"); break; }
        break;
      case "o":
        if (this.ends("ation")) { this.r("ate"); break; }
        if (this.ends("ator")) { this.r("ate"); break; }
        break;
      case "s":
        if (this.ends("alism")) { this.r("al"); break; }
        if (this.ends("iveness")) { this.r("ive"); break; }
        if (this.ends("fulness")) { this.r("ful"); break; }
        if (this.ends("ousness")) { this.r("ous"); break; }
        break;
      case "t":
        if (this.ends("aliti")) { this.r("al"); break; }
        if (this.ends("iviti")) { this.r("ive"); break; }
        if (this.ends("biliti")) { this.r("ble"); break; }
        break;
      case "g":
        if (this.ends("logi")) { this.r("log"); break; }
        break;
    }
  }

  /**
   * step3() deals with -ic-, -full, -ness etc. similar strategy to step2.
   */
  private step3(): void {
    switch (this.b[this.k]) {
      case "e":
        if (this.ends("icate")) { this.r("ic"); break; }
        if (this.ends("ative")) { this.r(""); break; }
        if (this.ends("alize")) { this.r("al"); break; }
        break;
      case "i":
        if (this.ends("iciti")) { this.r("ic"); break; }
        break;
      case "l":
        if (this.ends("ical")) { this.r("ic"); break; }
        if (this.ends("ful")) { this.r(""); break; }
        break;
      case "s":
        if (this.ends("ness")) { this.r(""); break; }
        break;
    }
  }

  /**
   * step4() takes off -ant, -ence etc., in context <c>vcvc<v>.
   */
  private step4(): void {
    switch (this.b[this.k - 1]) {
      case "a":
        if (this.ends("al")) break;
        return;
      case "c":
        if (this.ends("ance")) break;
        if (this.ends("ence")) break;
        return;
      case "e":
        if (this.ends("er")) break;
        return;
      case "i":
        if (this.ends("ic")) break;
        return;
      case "l":
        if (this.ends("able")) break;
        if (this.ends("ible")) break;
        return;
      case "n":
        if (this.ends("ant")) break;
        if (this.ends("ement")) break;
        if (this.ends("ment")) break;
        if (this.ends("ent")) break;
        return;
      case "o":
        if (this.ends("ion") && (this.b[this.j] === "s" || this.b[this.j] === "t")) break;
        if (this.ends("ou")) break;
        return;
      case "s":
        if (this.ends("ism")) break;
        return;
      case "t":
        if (this.ends("ate")) break;
        if (this.ends("iti")) break;
        return;
      case "u":
        if (this.ends("ous")) break;
        return;
      case "v":
        if (this.ends("ive")) break;
        return;
      case "z":
        if (this.ends("ize")) break;
        return;
      default:
        return;
    }
    if (this.measure() > 1) this.k = this.j;
  }

  /**
   * step5() removes a final -e if m() > 1, and changes -ll to -l if m() > 1.
   */
  private step5(): void {
    this.j = this.k;
    if (this.b[this.k] === "e") {
      const a = this.measure();
      if (a > 1 || (a === 1 && !this.cvc(this.k - 1))) this.k--;
    }
    if (this.b[this.k] === "l" && this.endsDoubleConsonant(this.k) && this.measure() > 1) this.k--;
  }

  /**
   * Stem the word.
   */
  public stem(word: string): string {
    if (word.length <= 2) return word;
    this.b = word.toLowerCase();
    this.k = word.length - 1;
    this.k0 = 0;
    this.step1ab();
    this.step1c();
    this.step2();
    this.step3();
    this.step4();
    this.step5();
    return this.b.substring(0, this.k + 1);
  }
}
