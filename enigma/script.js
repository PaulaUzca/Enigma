var output = document.getElementById("result");
var textInput = document.getElementById("textbox")
var encripted_letter;
var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
var plugboard = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
class Rotor {
    constructor(wiring, name, notch) {
        this.name = name;
        this.wiring = wiring.split('');
        this.abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        this.notchs = notch.split("-");
        this.notch = this.notchs[0];
        this.notchNext = this.notchs[1];
    }

    rotate() {
        this.wiring.push(this.wiring.shift());
        this.abc.push(this.abc.shift());
    }

    /*El ring setting lo que hace es cambiar la letra que se tenia en el wiring, n cantidad de veces
    subiendo por el abecedarion
    ejemplo
    En el rotor 1 tenemos que
    abcdefghijklmnopqrstuvwxyz
    ekmflgdqvzntowyhxuspaibrcj

    Si le ponemos un ringsetting de 2, es decir un ring setting de B
    Se me van a cambiar todas las letras a mas 1 en el abecedario

    abcdefghijklmnopqrstuvwxyz
    flngmherwaoupxziyvtqbjcsdk

    Aqui e cambio a f porque porque la letra que le sigue en el abecedario es esa
    abcd E -> F ghijk...
    */
    ringSettings(ring) {
        for (let i = 0; i < 26; i++) {
            let index = abc.indexOf(this.wiring[i]); //Obtengo la posicion d ela letra en el abc
            for (let a = 1; a < ring; a++) { //Esa letra la tengo que "subir" n posiciones en el abc
                if (index < 25) { //Tengo que asegurarme que sea menor a 25 pues si llega a un index de 26 eso no existe en el array
                    index++;
                }
                else {
                    index = 0; //Lo dejo en cero y de igual forma se seguiran sumando las posiciones que falten...
                }
            }
            this.wiring[i] = abc[index]; //El nuevo setting sera la letra en el abc a n letras de la mia
        }
        for (let e = 1; e < ring; e++) {
            let last = this.wiring.pop();
            this.wiring.unshift(last);
        }
    }
    setInitialKey(key) {
        while (this.abc[0] != key) {
            this.rotate();
        }
    }
}

var rotorI = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "I", "Q-R");
var rotorII = new Rotor("AJDKSIRUXBLHWTMCQGZNPYFVOE", "II", "E-F");
var rotorIII = new Rotor("BDFHJLCPRTXVZNYEIWGAKMUSQO", "III", "V-W");
var rotorIV = new Rotor("ESOVPZJAYQUIRHXLNFTGKDCMWB", "IV", "J-K");
var rotorV = new Rotor("VZBRGITYUPSDNHLXAWMJQOFECK", "V", "Z-A");

class Reflector {
    constructor(wiring, name) {
        this.wiring = wiring.split('');
        this.name = name;
    }
}

var reflectorB = new Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT", "UKW-B");
var reflectorC = new Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL", "UKW-C")

function makePlugboard(changesArray) {
    for (let l = 0; l < changesArray.length; l++) {
        letter = changesArray[l].split('');
        plugboard[abc.indexOf(letter[0])] = letter[1];
        plugboard[abc.indexOf(letter[1])] = letter[0];
    }
}

//Settings:
var rotorSlow = rotorI;
var rotorMedium = rotorII;
var rotorFast = rotorIII;
var reflector = reflectorB;

rotorFast.ringSettings(4); //D - 4
rotorMedium.ringSettings(abc.indexOf("G")+1); // El ring podia estar representado por una letra o un número
rotorSlow.ringSettings(abc.indexOf("M")+1);


rotorFast.setInitialKey("K");
let plugs = ["TF"]
makePlugboard(plugs);

/*Recordemos el orden de la maquina
    reflector - rotor1 - rotor2 - rotor3 <---- Letra
*/

function enter(){
    let message = textInput.value.split('');
    for (let index = 0; index < message.length; index++) {
        encrypt(message[index].toUpperCase());
    }
}
//Para que me deje escribir solor letras en la caja de texto
function lettersValidate(event) {
    if (abc.includes(event.key.toUpperCase())) {
        return true;
    }
    else {
        return false;
    } 
}

//Contador para separar las letras en pedazos de a 5
var contador = 0;
textInput.addEventListener("keydown", function (event) {
    if(event.keyCode == 13){
        enter();
    }
    if (event.ctrlKey === false) { //Para que al hacer ctrl+v o ctrl+c no se encripten las letras v o c
    encrypt(event.key.toUpperCase());
    }

});

//La primera ronda de encripcion (desde el teclado pasa por los 3 rotores hasta llegar al reflector) *ejemplo al final
function round1(rotor, letter) {
    let result;

    index = abc.indexOf(letter);
    result = rotor.wiring[index];

    index = rotor.abc.indexOf(result);
    result = abc[index];

    //console.log(rotor.name + ": "+ letter +"-->"+result);
    return result;
}

//Segunda ronda de encripcion (desde el reflector pasa por los 3 rotores de forma inversa hasta llegar a el teclado) *ejemplo al final
function round2(rotor, letter) {
    let result;

    index = abc.indexOf(letter);
    result = rotor.abc[index];

    index = rotor.wiring.indexOf(result);
    result = abc[index];
    //console.log(rotor.name + ": "+ letter +"-->"+result);

    return result;

}

//El reflector solo convierte la letra de acuerdo a su posicion en el abc a posicion en el reflector
/* Ejemplo con reflector B:
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
| | | | | | | | | | | | | | | | | | | | | | | | | | 
Y R U H Q S L D P X N G O K M I E B F Z C W V J A T
*/
function reflection(reflector, letter) {
    let index = abc.indexOf(letter);
    return reflector.wiring[index];
}

function encrypt(letter) {
    if (abc.includes(letter)) {

        //Primero pasamos la letra por el plugboard
        encripted_letter = plugboard[abc.indexOf(letter)];

        rotorFast.rotate();
        if (rotorFast.abc[0] == rotorFast.notchNext) { //Si el rotor ya paso la posicon del notch quiere decir que es hora de rotar el siguiente
            console.log("middle rotation");
            rotorMedium.rotate();

            if (rotorMedium.abc[0] == rotorMedium.notch) { //Si el rotor esta en la posicion del notch es hora de rotar el siguiente rotor
                console.log("slow rotation ");
                rotorSlow.rotate();
                rotorMedium.rotate();   //Aqui es importante hacer la doble rotación (double stepping)
                // En el enigma como los rotores estaban conectados entre si. Si rotor del final gira, el rotor de en medio también tendrá que girar
                //Esto tambien pasa en el primer rotor o el rotor rápido, cuando el rotor del medio gira, este debería girar también
                //pero como es el rotor rapido, y de igual forma va a girar en la siguiente presión de tecla, es innecesario hacerlo girar. Y no afecta el resultado
            }
        }

        //Una vez todos los rotores estan en posición... A encriptar!

        // Dirección de encripción en Enigma <------
        encripted_letter = round1(rotorFast, encripted_letter);
        encripted_letter = round1(rotorMedium, encripted_letter);
        encripted_letter = round1(rotorSlow, encripted_letter);

        encripted_letter = reflection(reflector, encripted_letter);

        //Direccion de encripción en Enigma ------>
        encripted_letter = round2(rotorSlow, encripted_letter);
        encripted_letter = round2(rotorMedium, encripted_letter);
        encripted_letter = round2(rotorFast, encripted_letter,);

        //Al final tambien pasamos por el plugboard
        encripted_letter = plugboard[abc.indexOf(encripted_letter)];

        output.innerHTML += encripted_letter;
        contador++;
        if (contador == 5) {
            output.innerHTML += " ";
            contador = 0;
        }
    }
}


/* Ejemplo con rotor III Rotación en A A A Entra la letra A
    OJO al momento de presionar el boton se rota el engranaje, por lo que ya tenemos una rotacion en el rotor III

    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
    | | | | | | | | | | | | | | | | | | | | | | | | | |
    D F H J L C P R T X V Z N Y E I W G A K M U S Q O B     Rotor III
    |___
        |
    B C D E F G H I J K L M N O P Q R S T U V W X Y Z A     Rotor III
    | | | | | | | | | | | | | | | | | | | | | | | | | |
    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

    A -> D -> C

*/
/*Ejemplo: Regresandose por el rotor I y II y finalmente llegando al rotor III tenemos que:
    III A -> D -> C
    II C -> C -> D
    I D -> D -> F

    ReflectorB F -> S

    III S -> S -> S
    II S -> S -> E
    I E -> ?

    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
    | | | | | | | | | | | | | | | | | | | | | | | | | |
    B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
       _____|
      |
    D F H J L C P R T X V Z N Y E I W G A K M U S Q O B
    | | | | | | | | | | | | | | | | | | | | | | | | | |
    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

    Tenemos que E -> F -> B

    Observemos que la letra entra al contrario, porque esta llendo en la direccion opuesta (->)
    Entonces primero pasa por el abc del rotor (o ring setting creo que tambien lo llaman)
    Y luego si pasa por la secuencia de letras propia del rotor (wiring setting)
*/