/* eslint-disable no-useless-escape */
class Regexs {
   integer = /[^0-9]/g;
   string = /[^a-zA-ZÀ-Ỹà-ỹĂăÂâĐđÊêÔôƠơƯư]/g;
   email =
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
   uppercaseCharacters = /.*[A-Z].*/;
   phoneVn = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
   characterCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\|=]/;
   number = /^[1-9]\d*$/;
   cmnd = /^[1-9]{11}\b/g;
   bankNumber = /^(?:\d{10}|\d{19})$/;
   password = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
   licensePlate = /^[0-9]{2}[A-Z]{1}-[0-9]{4,5}\.[0-9]{1,2}$/;
}
const regexs = new Regexs();

export { regexs };
