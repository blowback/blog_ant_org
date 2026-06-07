/* Prism language definition: BBC BASIC (Z80 edition).
 * As used on the Z88, CP/M, and other Z80 machines. Load AFTER prism core.
 * Usage in posts: ```bbcbasic fenced code blocks.
 */
(function (Prism) {
  Prism.languages.bbcbasic = {
    // REM ... to end of line
    comment: {
      pattern: /\bREM\b.*/i,
      greedy: true,
    },

    // "strings" (no escapes in BBC BASIC)
    string: {
      pattern: /"[^"\r\n]*"/,
      greedy: true,
    },

    // *commands (OSCLI) e.g. *CAT, *LOAD, *FX — at statement start
    'star-command': {
      pattern: /(^|\s|:)\*[A-Z][^\r\n:]*/i,
      lookbehind: true,
      alias: 'builtin',
    },

    // PROCname / FNname definitions and calls
    procedure: {
      pattern: /\b(?:PROC|FN)[A-Z_]\w*/i,
      alias: 'function',
    },

    // statement keywords
    keyword:
      /\b(?:AND|CALL|CASE|CHAIN|CLEAR|CLG|CLOSE|CLS|COLOU?R|DATA|DEF|DIM|DIV|DRAW|ELSE|END|ENDCASE|ENDIF|ENDPROC|ENDWHILE|ENVELOPE|EOR|ERROR|FOR|GCOL|GOSUB|GOTO|IF|INPUT|INSTALL|LET|LIBRARY|LINE|LOCAL|MOD|MODE|MOVE|NEXT|NOT|OF|OFF|ON|OR|OSCLI|OTHERWISE|PLOT|PRINT|PROC|PTR|QUIT|READ|REM|REPEAT|REPORT|RESTORE|RETURN|RUN|SOUND|STEP|STOP|SWAP|SYS|THEN|TINT|TO|TRACE|UNTIL|VDU|WAIT|WHEN|WHILE|WIDTH)\b/i,

    // built-in functions
    function:
      /\b(?:ABS|ACS|ADVAL|ASC|ASN|ATN|BGET|CHR\$|COS|COUNT|DEG|DIM|EOF|ERL|ERR|EVAL|EXP|EXT|FALSE|GET|GET\$|INKEY|INKEY\$|INSTR|INT|LEFT\$|LEN|LN|LOG|MID\$|OPENIN|OPENOUT|OPENUP|PI|POINT|POS|RAD|RIGHT\$|RND|SGN|SIN|SQR|STR\$|STRING\$|TAB|TAN|TIME|TOP|TRUE|USR|VAL|VPOS)\b/i,

    // resident integer / system pseudo-variables and PAGE/HIMEM etc.
    builtin: /\b(?:PAGE|LOMEM|HIMEM|TIME|COUNT|@%|[A-Z]%)\b/i,

    // line numbers at the start of a line
    'line-number': {
      pattern: /^\s*\d+/m,
      alias: 'symbol',
    },

    // &hex, decimals, floats
    number: /&[\dA-F]+|\b\d*\.?\d+(?:E[-+]?\d+)?\b/i,

    // string ($) and integer (%) suffixed variables
    variable: /\b[A-Z_]\w*[$%]?/i,

    operator: /<[=>]?|>=?|[-+*/^=]/,
    punctuation: /[(),;:]/,
  };
})(Prism);
