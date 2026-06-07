/* Prism language definition: ANS Forth.
 * Forth is whitespace-delimited; words can contain symbols, so most tokens
 * are matched between whitespace boundaries with (^|\s) ... (?=\s|$).
 * Load AFTER prism core. Usage in posts: ```forth fenced code blocks.
 */
(function (Prism) {
  Prism.languages.forth = {
    comment: [
      // \ line comment  (backslash then space/EOL)
      { pattern: /(^|\s)\\(?:\s.*|$)/m, lookbehind: true, greedy: true },
      // ( stack comment )  — requires a space after the open paren
      { pattern: /(^|\s)\((?:\s[^)]*)?\)/, lookbehind: true, greedy: true },
    ],

    // string-producing words:  ." ..."   s" ..."   c" ..."   abort" ..."   .( ...)
    string: {
      pattern: /(^|\s)(?:\.\(|(?:\.|s|c|abort)")[^")]*[")]/i,
      lookbehind: true,
      greedy: true,
    },

    // colon definition:  : name ...   (and :noname)
    definition: {
      pattern: /(^|\s):(?:noname)?\s+\S+/,
      lookbehind: true,
      inside: {
        keyword: /^:\S*/,
        function: /\S+$/,
      },
    },

    // control-flow & defining words
    keyword: {
      pattern:
        /(^|\s)(?:;|immediate|if|else|then|begin|until|while|repeat|again|\??do|\??loop|\+loop|leave|unloop|i|j|case|of|endof|endcase|exit|recurse|does>|create|variable|2variable|constant|2constant|value|defer|to|is|postpone|literal|\[|\]|\['\]|\[char\]|char|'|execute|compile,|\[compile\]|immediate|abort|quit)(?=\s|$)/i,
      lookbehind: true,
    },

    // common stack / memory / IO words
    function: {
      pattern:
        /(^|\s)(?:\?dup|dup|drop|swap|over|rot|-rot|nip|tuck|pick|roll|2dup|2drop|2swap|2over|>r|r>|r@|2>r|2r>|2r@|depth|@|!|\+!|c@|c!|2@|2!|cells|cell\+|chars|char\+|aligned|align|allot|here|,|c,|emit|type|cr|space|spaces|key|key\?|\.|\.r|u\.|u\.r|\.s|count|move|cmove|fill|erase|word|find|>body|>in|base|hex|decimal|bl|tib|accept|number)(?=\s|$)/i,
      lookbehind: true,
    },

    // arithmetic / logical / comparison words
    operator: {
      pattern:
        /(^|\s)(?:\*\/mod|\*\/|\/mod|[-+*/]|mod|=|<>|u?<=?|u?>=?|0=|0<>|0<|0>|and|or|xor|invert|lshift|rshift|1\+|1-|2\*|2\/|negate|abs|min|max|s>d|d>s|m\*|um\*|um\/mod|sm\/rem|fm\/mod)(?=\s|$)/i,
      lookbehind: true,
    },

    // numbers: $hex, #decimal, %binary, plain ints, doubles (1.)
    number: {
      pattern: /(^|\s)(?:\$[\da-f]+|#-?\d+|%[01]+|-?\d+\.?\d*)(?=\s|$)/i,
      lookbehind: true,
    },
  };
})(Prism);
