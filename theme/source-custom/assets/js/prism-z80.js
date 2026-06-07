/* Prism language definition: Z80 assembly (sjasmplus dialect).
 * Loosely models the custom Rouge lexer used on the old Jekyll blog.
 * Load AFTER prism core. Usage in posts: ```z80 fenced code blocks.
 */
(function (Prism) {
  Prism.languages.z80 = {
    // ; line comments  and  /* block */ (sjasmplus allows C-style too)
    comment: [
      { pattern: /;.*/, greedy: true },
      { pattern: /\/\*[\s\S]*?\*\//, greedy: true },
    ],

    // "strings" and 'chars'
    string: {
      pattern: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
      greedy: true,
    },

    // sjasmplus directives & pseudo-ops (leading . optional)
    directive: {
      pattern: /(^|\s)\.?(?:org|equ|defb|db|defw|dw|defs|ds|defm|dm|byte|word|block|align|incbin|include|module|endmodule|macro|endm|rept|endr|dup|edup|if|ifdef|ifndef|else|endif|assert|device|output|page|map|struct|ends|proc|endp|local|global|export|import|end)\b/i,
      lookbehind: true,
      alias: 'keyword',
    },

    // Z80 mnemonics
    opcode: {
      pattern: /(^|\s)(?:adc|add|and|bit|call|ccf|cp|cpd|cpdr|cpi|cpir|cpl|daa|dec|di|djnz|ei|ex|exx|halt|im|in|inc|ind|indr|ini|inir|jp|jr|ld|ldd|lddr|ldi|ldir|neg|nop|or|otdr|otir|out|outd|outi|pop|push|res|ret|reti|retn|rl|rla|rlc|rlca|rld|rr|rra|rrc|rrca|rrd|rst|sbc|scf|set|sla|sll|sli|sra|srl|sub|xor)\b/i,
      lookbehind: true,
      alias: 'keyword',
    },

    // registers and condition codes
    register: {
      pattern: /(^|\s|,|\()(?:a|b|c|d|e|h|l|i|r|af|bc|de|hl|ix|iy|ixh|ixl|iyh|iyl|sp|pc|af'|nz|nc|po|pe|p|m|z)\b/i,
      lookbehind: true,
      alias: 'variable',
    },

    // numbers: $hex, 0xhex, hhex 'h', %bin, 0b, decimal
    number: /\b(?:0x[\da-f]+|[\da-f]+h|\$[\da-f]+|0b[01]+|[01]+b|%[01]+|\d+)\b/i,

    // labels at start of line (foo:  or  .local)
    label: {
      pattern: /^\s*[.@]?[a-z_][\w.$]*:/im,
      alias: 'symbol',
    },

    operator: /[-+*/%&|^~!<>=]=?|<<|>>|&&|\|\|/,
    punctuation: /[(),\[\]{}:]/,
  };
})(Prism);
