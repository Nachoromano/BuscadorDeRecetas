function iniciarApp (){

    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');

    if(selectCategorias) {
    selectCategorias.addEventListener('change', seleccionarCategoria);
    obtenerCategoria();
    }

    const favoritosDiv = document.querySelector('.favoritos')
    if(favoritosDiv){
        ObtenerFavoritos();
    }

    const modal = new bootstrap.Modal('#modal',{});



    function obtenerCategoria(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
          .then(respuesta =>  respuesta.json())
          .then( resultado => mostrarCategoria(resultado.categories) )    
    }

    function mostrarCategoria(categorias = []){
        categorias.forEach( categoria =>{
            
            const {strCategory} = categoria;
            const option = document.createElement('option');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategorias.appendChild(option);



        } )
    }

    function seleccionarCategoria(e){
        const categoria = e.target.value;

        const url= `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)
           .then(respuesta => respuesta.json())
           .then(resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas(recetas = []){
        limpiarHTML(resultado);

        const heading = document.createElement('h2');
        heading.classList.add('text-center','text-black','my-5');
        heading.textContent = recetas.length ? 'Resultados' : 'no hay Resultado'
        resultado.appendChild(heading)


        //Iterar en los resultados 
        recetas.forEach(receta =>{
            const {idMeal,strMeal,strMealThumb} = receta;



            const recetaContenedor = document.createElement('div');
            recetaContenedor.classList.add('col-md-4')

            const recetaCard = document.createElement('div');
            recetaCard.classList.add('card','mb-4');

            const recetaImg = document.createElement('img');
            recetaImg.classList.add('card-img-top');
            recetaImg.alt = `Imagen de la reseta ${strMeal ?? receta.img}`
            recetaImg.src = strMealThumb ?? receta.img ;

            const recetaCardBody = document.createElement('div');
            recetaCardBody.classList.add('card-body');
            

            const recetaHeading = document.createElement('h3');
            recetaHeading.classList.add('card-title','mb-3');
            recetaHeading.textContent = strMeal ?? receta.nombre ;

            const recetaBtn = document.createElement('button');
            recetaBtn.classList.add('btn','btn-danger','w-100');
            recetaBtn.textContent = 'Ver receta';
            // recetaBtn.dataset.bsTarget = "#modal";
            // recetaBtn.dataset.bsToggle = " modal";
            recetaBtn.onclick = function(){
                seleccionarReceta(idMeal ?? receta.id);
            }


            //Inyectar en el codigo HTML

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaBtn);

            recetaCard.appendChild(recetaImg);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);
        });



        function seleccionarReceta(id){
            const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
            fetch(url)
               .then(respuesta => respuesta.json())
               .then(resultado => mostrarRecetaModal(resultado.meals[0]))
        }

        function mostrarRecetaModal (receta){

            const {idMeal,strInstructions,strMeal,strMealThumb} = receta;
            
            //Añadir contenido al modal
            const modalTitle = document.querySelector('.modal .modal-title');
            const modalBody = document.querySelector('.modal .modal-body');

            modalTitle.textContent = strMeal;
            modalBody.innerHTML = `
                 <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"/>
                 <h3 class="my-3">Instrucciones</h3>
                 <p>${strInstructions}</p>
                 <h3 class="my-3"> Ingredientes y cantidades </h3>
            `;

            const listGroup = document.createElement('ul');
            listGroup.classList.add('list-group');

            //Mostrar cantidades e ingredientes
            for(let i = 1; i<=20; i++ ){
                if(receta[`strIngredient${i}`]){
                    const ingrediente = receta[`strIngredient${i}`];
                    const cantidad = receta[`strMeasure${i}`];

                    const ingredienteLi = document.createElement('li');
                    ingredienteLi.classList.add('list-group-item');
                    ingredienteLi.textContent = `${ingrediente} - ${cantidad}`

                    listGroup.appendChild(ingredienteLi)

                }
            }
            
            modalBody.appendChild(listGroup);

            const modalFooter = document.querySelector('.modal-footer')
            limpiarHTML(modalFooter);

            //Botones de cerrar y favorito
            const btnFav = document.createElement('button');
            btnFav.classList.add('btn','btn-danger','col');
            btnFav.textContent = existeStorage(idMeal) ?  'Eliminar de favorito' : 'Guardar a Favorito';

            //Almacenar receta en localStorage
            btnFav.onclick = function(){
                if(existeStorage(idMeal)){
                    eliminarFavorito(idMeal);
                    btnFav.textContent = 'Guardar a favorito';
                    mostrarToast('Eliminado Correctamente');
                    return
                }

                agregarFav({
                    id: idMeal,
                    nombre: strMeal,
                    img:strMealThumb
                });
                btnFav.textContent = 'Eliminar de favorito';
                mostrarToast('Agregado correctamente');
            }

            const btnClose = document.createElement('button');
            btnClose.classList.add('btn','btn-secondary','col');
            btnClose.textContent = 'Cerrar';
            btnClose.onclick = function(){
                modal.hide()
            }

            modalFooter.appendChild(btnFav);
            modalFooter.appendChild(btnClose);



            //Mostrar modal
            modal.show();
        }

        function eliminarFavorito(id){
            const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
            const nuevoFavoritos = favoritos.filter(favoritos => favoritos.id !== id);
            localStorage.setItem('favoritos',JSON.stringify(nuevoFavoritos))
        }

        function agregarFav(receta){
            const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
            localStorage.setItem('favoritos', JSON.stringify([...favoritos,receta]));
        }

        function existeStorage (id){
            const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
            return favoritos.some(favorito => favorito.id === id);
        }

        function mostrarToast (mensaje){
            const toastDiv = document.querySelector('#toast');
            const toastBody = document.querySelector('.toast-body');
            const toast = new bootstrap.Toast(toastDiv);
            toastBody.textContent = mensaje;
            toast.show();
        }


        function limpiarHTML(selector){
            while(selector.firstChild){
                selector.removeChild(selector.firstChild);
            }
        }
    }

    function ObtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length) {
            mostrarRecetas(favoritos);
            return 
        }else{
        const noFavorito = document.createElement('p');
        noFavorito.textContent = 'No hay favoritos aun';
        noFavorito.classList.add('fs-4','text-center','font-bold','mt-5');
        favoritosDiv.appendChild(noFavorito);
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp );

