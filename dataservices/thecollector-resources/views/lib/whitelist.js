// Must be a list of SIGN ONLY keys
var whitelist = [
    {
        'owner': 'jim.klo+test@learningregistry.org',
        'public_key': 
            '-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
            'Version: GnuPG/MacGPG2 v2.0.19 (Darwin)\n' +
            'Comment: GPGTools - http://gpgtools.org\n' +
            '\n' +
            'mQENBE/hNj8BCADMa9VHHAXHuERFownr8SJxt2t7jZTqblWn1C9V4rmReX15QhZG\n' +
            'ChoF71WOvLdf35+vT0ohfgWbyQEA7yznzhYqkqtZpqIVEgB5LpMnTRy/buQzTYTL\n' +
            'JN7+1UnJ2lPKg6CyuqIVRxkQc7baArPPjuYnjE18PGrDq28ermayaqxJOKfUlTLi\n' +
            'IUxi0R2m/7wkUcrE3W72TyeLvQ1icqkS5MlH17aRTeWQPCeHJnAunzamOmIhO0ko\n' +
            'YanRf1tg2xvhEUeVMyGPmZAaJ3ic9I77c1DIk5kwCIMHiCxtwnKwiHjco0KZUsq2\n' +
            'fD6lL1GqFFHxSIAnWE0YgMpd/GS5huqqoP9JABEBAAG0PkxlYXJuaW5nIFJlZ2lz\n' +
            'dHJ5IFRlc3QgS2V5IDxqaW0ua2xvK3Rlc3RAbGVhcm5pbmdyZWdpc3RyeS5vcmc+\n' +
            'iQE+BBMBAgAoBQJP4TY/AhsvBQkHhh+ABgsJCAcDAgYVCAIJCgsEFgIDAQIeAQIX\n' +
            'gAAKCRAUlSLjcnSQZvvnCACHIikS4Ur7XlfTJQQ72XEX0yo698x1P2Qz8za+BUxh\n' +
            'aOvq8BimNsk0jo52DSrj6fIuyrZwRZyUD3G7e0mOFm6cT4kJJuCsk7Yt4oZzLRH/\n' +
            'VN7hxmFxo5OS3aZu4wvG8asY8qUYjS1FCStissrq4JzwoUtIkjxi6GZg2cNvKC2u\n' +
            'O9xMC1wfF3Mzbm6jKuQ7dpjxp7I6cFqGyvecxzVbUTqATdiHuiiHbkkZ0Ag4Inq+\n' +
            'kZBV39eD0uqnInoRQ7ECY2ixn4U5ZCkx/4RhqJ9Eoi44dM+OPM/dD+d0x7yqfn6s\n' +
            'f5cV/Flc3NQaWBgexEZeVZUE5KOOerQV7EI/7DdTOOcB\n' +
            '=xJKb\n' +
            '-----END PGP PUBLIC KEY BLOCK-----\n'
    },
    {
        'owner': 'LearnReg 1 Node (Resource Data Signing) <jim.klo@sri.com>',
        'public_key':
            '-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
            'Version: GnuPG v1.4.10 (GNU/Linux)\n' +
            '\n' +
            'mQMuBE/iPc8RCACDCGdOagh8owZlCB6Jecp5L1+3tpxoORcF4wWyCENKtC4rfPKa\n' +
            'Rzevpzg3Pz5LdevMvHIIYfw6AzeEEcZ/Ukv/agHxOrQcAt/to94WIks2pr3R+mP6\n' +
            '1eqjAYMZQ4phqX78VQErOku8yolsReSl/bdShRU6ZHQo45Rq+5Cg+0nDKWpkzVjJ\n' +
            'HOZcZrQ9iyU1vau7mjmACQGN9YZIs9rDT4SYMQU1qyHeg8URFrNT12iuvH//sjuJ\n' +
            'o+2e3VQ3KPkLmbzy+Hxqb6+uIt3idSj6EQAdcsiwssJ1TBZfk5A3I64CpjOSE1mm\n' +
            'v20EdwDcOoqdTGSMLtwZlZFjuh+8T8a4FBMTAQCoaEKRRNUDNmmI6cTXJcsnKUzE\n' +
            'GYYDWkpMOvYQ4NDIjQf/dNWldvvqiM7Ayx/0aD+Q3Ocwsv3sRdinNIdD2gho+J3C\n' +
            'vX1+heuGzrN5C4NxmFwx7qLexu/7sHwXgFoOU27Z/Em6CUn7Yh6XKIFhfOaBlcs0\n' +
            'TeIUNstkA3bTXr+xp/3pGLMZ0Hl6GKB50mjayl7MQZjbaIGPQv4Cjdbi0+4Xau3T\n' +
            'yzqUc24rt7+SdwxYK/7f3NVV3LKoWAxlhWLryRfNDSxRhC6xJFJwUJxP8jaIuGs+\n' +
            'AZwLjvafMklPzXigmgqplLKDYCKgFrA91M2fcc2KBqYn1vkkiuaKpgQU39G9B2za\n' +
            'AIW8VnL2kGp0xQeusP13nNqU2z5LRJXYhz81tAUk6wf9FxuivQwLkHHeM8Z2lekQ\n' +
            'DygK9J2kKxH8mcjrwWwT8QsQS5TsPuOiahClWojXYZt0VDeg+nZSTDW3h/9IZxCw\n' +
            'v2r9WQcGmkYXVgxsqxgwV7OlNGDVwN1U6IMjveGMXA1Xw8N1xkaU0ofWWEsPVyZp\n' +
            'gXf1Avx2EdB7VyyiKL3jL9Wmf5ziy/NzrANIrbBeHyFzPC2eeUl3sugl2BNe+U0y\n' +
            'fxe1UVptrGNcDeecdbzyRVQzCswb1jOulAKJOb/fIut7nRYvtYFR7e5AQzwg8KPb\n' +
            'DVfPLcfhFep96b7MbjHaruM3AL2UwFfP1YRt788V+n20H7MWs7uRdY88jHI1tOog\n' +
            'GbQ5TGVhcm5SZWcgMSBOb2RlIChSZXNvdXJjZSBEYXRhIFNpZ25pbmcpIDxqaW0u\n' +
            'a2xvQHNyaS5jb20+iHoEExEIACIFAk/iPc8CGwMGCwkIBwMCBhUIAgkKCwQWAgMB\n' +
            'Ah4BAheAAAoJEMLkrvBsvdS+5NsBAJLC0ouyTFktqdsLDVYdIYKxprhEBNySs5zn\n' +
            '3pBF6q1TAP95L5loOiJgE1/envJjbJDmwdL0mJZl0bMe7XxIv5AURg==\n' +
            '=Xh4d\n' +
            '-----END PGP PUBLIC KEY BLOCK-----\n'
    }
];


function joinKeys(keymap) {
    var keylist = "";
    for (var key in keymap) {
        keylist += keymap[key];
    }
    return keylist;
}

exports.armoredPublicKeys = whitelist;
