'use strict';
/* =========================================================
   reglas-bellavista.js — el catálogo de papeltapizbellavista.com

   386 referencias de papel tapiz de una tienda dominicana, y de
   ellas entran 109. El recorte no es nuestro: es el de la
   tienda, y sale limpio porque sus datos se corresponden con lo
   que de verdad vende.

   De los 386, 277 están agotados —descontinuados, más bien: la
   tienda los deja publicados pero sin existencias— y ninguno de
   esos declara la medida de su rollo ni trae foto. Los 109
   disponibles, en cambio, los declaran TODOS: rollo de 0.53 ×
   10.05 m, cobertura de 5 m², y todos con imagen. Las dos
   reglas que ya rigen en este catálogo —no entra lo agotado, no
   entra lo que no declara su cobertura— recortan exactamente el
   mismo conjunto, cada una por su lado.

   EL ITBIS LO DECLARA
   -------------------
   Su propia columna dice «Precio RD$ (ITBIS incl.)». Es de los
   pocos comercios del directorio que lo dice en vez de dejarlo
   al supuesto de mostrador, y así se registra: como dato.

   LOS NOMBRES SON CÓDIGOS
   -----------------------
   «150-1004», «2SY27104», «9082A». No hay nada que hacer ahí y
   tampoco hace falta: la partida es «Papel tapiz», que se
   compara por precio, y en el explorador visual quien informa
   es la foto.
   ========================================================= */

const REV = require('./especificacion-revestimiento.js');

const MOTIVO = { valor: '' };

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  if (!/^disponible$/i.test(a.disponibilidad)) {
    MOTIVO.valor = 'artículo agotado: la tienda lo deja publicado pero sin existencias';
    return null;
  }
  if (!/papel tapiz/i.test(a.cat1)) {
    MOTIVO.valor = 'artículo que no es revestimiento mural';
    return null;
  }

  const d = REV.area(a);
  if (!d) { MOTIVO.valor = 'la ficha no declara la cobertura del rollo'; return null; }

  const spec = REV.item('papel-tapiz', {});
  if (!spec) return null;
  spec.factorUnidad = {
    veces: 1 / d.area_m2,
    nota: 'La tienda cobra por rollo de ' + (a.medida || '').trim() + ' y declara que cubre ' +
          d.area_m2 + ' m²; aquí va el precio del m²'
  };
  return spec;
}

module.exports = { regla, MOTIVO };
