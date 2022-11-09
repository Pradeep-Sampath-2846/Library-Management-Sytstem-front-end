const API_END_POINT = 'http://localhost:8080/lms/api';
const pageSize = 4;
let page = 1;

getBooks();

async function getBooks(query=`${$('#txt-search').val()}`){
    try {
        const response =await fetch(`${API_END_POINT}/books?size=${pageSize}&page=${page}&q=${query}`);

        if(response.status===200){
            $('#loader').hide();
             const totalBooks =response.headers.get('X-Total-Count');
             initPagination(totalBooks);

             const books =await response.json();
             if(books.length ===0){
                $('#tbl-books').addClass('empty');
             }else{
                $('#tbl-books').removeClass('empty');
             }
             $('#tbl-books tbody tr').remove();

             books.forEach((book,index) => {
                const rowHtml = `
                <tr tabindex="0">
                    <td>${book.isbn}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.copies}</td>
                </tr>
                `;
                $('#tbl-books tbody').append(rowHtml);
            });
        }else{
            showToast('Failed to load the books, try refresh again',);
        }

        
    } catch (error) {
        showToast('Failed to load the books, Invalid request','error');
        
    }
}

function initPagination(totalBooks){
    const totalPages =Math.ceil(totalBooks/pageSize);

    if(page>totalPages){
        page =totalPages;
        getBooks();
        return;
    }

    if (totalPages <= 1){
        $("#pagination").addClass('d-none');
    }else{
        $("#pagination").removeClass('d-none');
    }

    let html = '';
    for(let i = 1; i <= totalPages; i++){
        html += `<li class="page-item ${i===page?'active':''}"><a class="page-link" href="#">${i}</a></li>`;
    }
    html = `
        <li class="page-item ${page === 1? 'disabled': ''}"><a class="page-link" href="#">Previous</a></li>
        ${html}
        <li class="page-item ${page === totalPages? 'disabled': ''}"><a class="page-link" href="#">Next</a></li>
    `;

    $('#pagination > .pagination').html(html);
}

function showToast(msg, msgType = 'warning'){
    $("#toast").removeClass('text-bg-warning')
        .removeClass('text-bg-primary')
        .removeClass('text-bg-error')
        .removeClass('text-bg-success');

    if (msgType === 'success'){
        $("#toast").addClass('text-bg-success');
    }else if (msgType === 'error'){
        $("#toast").addClass('text-bg-error');
    }else if(msgType === 'info'){
        $("#toast").addClass('text-bg-primary');
    }else {
        $("#toast").addClass('text-bg-warning');
    }

    $("#toast .toast-body").text(msg);
    $("#toast").toast('show');
}

$('#pagination > .pagination').click((eventData)=> {
    const elm = eventData.target;
    if (elm && elm.tagName === 'A'){
        const activePage = ($(elm).text());
        if (activePage === 'Next'){
            page++;
            getBooks();
        }else if (activePage === 'Previous'){
            page--;
            getBooks();
        }else{
            if (page !== activePage){
                page = +activePage;
                getBooks();
            }
        }
    }
});

$('#txt-search').on('input', () => {
    page = 1;
    getBooks();
});


$('#tbl-books tbody').keyup((eventData)=>{
    if (eventData.which === 38){
        const elm = document.activeElement.previousElementSibling;
        if (elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }else if (eventData.which === 40){
        const elm = document.activeElement.nextElementSibling;
        if (elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }
});

$(document).keydown((eventData)=>{
    if(eventData.ctrlKey && eventData.key === '/'){
        $("#txt-search").focus();
    }
});

$("#btn-new-book").click(()=> {
    const frmBookDetails = new 
                bootstrap.Modal(document.getElementById('frm-book-detail'));

    $("#txt-isbn, #txt-title, #txt-author, #txt-copies").attr('disabled', false).val('');                

    $("#frm-book-detail")
        .removeClass('edit')
        .addClass('new')
        .on('shown.bs.modal', ()=> {
            $("#txt-isbn").focus();
        });

        frmBookDetails.show();
});

$("#frm-book-detail form").submit((eventData)=> {
    eventData.preventDefault();
    $("#btn-save").click();
});

$("#btn-save").click(async ()=> {

    let isbn = $("#txt-isbn").val();
    const title = $("#txt-title").val();
    const author = $("#txt-author").val();
    const copies = $("#txt-copies").val();
    let validated = true;

    $("#txt-isbn, #txt-title, #txt-author ,#txt-copies").removeClass('is-invalid');

    if (!/^\d{13}$/.test(isbn)){
        $("#txt-isbn").addClass('is-invalid').select().focus();
        validated = false;
    }

    if (!/^[A-Za-z0-9 -]+$/.test(title)){
        $("#txt-title").addClass('is-invalid').select().focus();
        validated = false;
    }

    if (!/^[A-Za-z0-9 -]+$/.test(author)){
        $("#txt-author").addClass('is-invalid').select().focus();
        validated = false;
    }
    if (!/^\d+$/.test(copies)){
        $("#txt-copies").addClass('is-invalid').select().focus();
        validated = false;
    }

    if (!validated) return;

    try{
        $("#overlay").removeClass("d-none");
        console.log('working');
        ({isbn}=(await saveBook(isbn,title,author,copies)));
       
        
        $("#overlay").addClass("d-none");
        showToast(`Book has been saved successfully with the ISBN: ${isbn}`, 'success');
        $("#txt-isbn, #txt-title, #txt-author ,#txt-copies").val("");
        $("#txt-isbn").focus();
    }catch(e){
        console.log(e);
        $("#overlay").addClass("d-none");
        showToast("Failed to save the Book, try again", 'error');
        $("#txt-isbn").focus();
    }
    
});

async function saveBook(isbn,title,author,copies){
        const response =await fetch(`${API_END_POINT}/books`,{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isbn,title, author, copies
            })
        });
        console.log(response.status);
        if(response.status==201){
            showToast('Book has been succussfully saved','success');
            return await response.json();
        }else{
            throw new Error(response.status);
        }


}

$("#frm-book-detail").on('hidden.bs.modal', ()=> {
    getBooks();
});

$('#tbl-books tbody').click(({target})=> {
    if (!target) return;
    let rowElm = target.closest('tr');

    getMemeberDetails($(rowElm.cells[0]).text());
});

async function getMemeberDetails(isbn){
    try{
        const response = await fetch(`${API_END_POINT}/books/${isbn}`)
        if (response.ok){
            const book = await response.json(); 
            
            const frmBookDetails = new 
            bootstrap.Modal(document.getElementById('frm-book-detail'));

            $("#frm-book-detail")
                .removeClass('new').removeClass('edit');

            $("#txt-isbn").attr('disabled', 'true').val(book.isbn);
            $("#txt-title").attr('disabled', 'true').val(book.title);
            $("#txt-author").attr('disabled', 'true').val(book.author);
            $("#txt-copies").attr('disabled', 'true').val(book.copies);

            frmBookDetails.show();
        }else{
            throw new Error(response.status);
        }
    }catch(error){
        showToast('Failed to fetch the Book details');
    }
}

$("#btn-edit").click(()=> {
    $("#frm-book-detail").addClass('edit');
    $("#txt-isbn, #txt-title, #txt-author ,#txt-copies").attr('disabled', false);
});


$("#btn-update").click(async ()=> {

    const isbn = $("#txt-isbn").val();
    const title = $("#txt-title").val();
    const author = $("#txt-author").val();
    const copies = $("#txt-copies").val();
    let validated = true;

    $("#txt-isbn, #txt-title, #txt-author ,#txt-copies").removeClass('is-invalid');

    if (!/^\d{13}$/.test(isbn)){
        $("#txt-isbn").addClass('is-invalid').select().focus();
        validated = false;
    }

    if (!/^[A-Za-z0-9 -]+$/.test(title)){
        $("#txt-title").addClass('is-invalid').select().focus();
        validated = false;
    }

    if (!/^[A-Za-z0-9 -]+$/.test(author)){
        $("#txt-author").addClass('is-invalid').select().focus();
        validated = false;
    }
    if (!/^\d+$/.test(copies)){
        $("#txt-copies").addClass('is-invalid').select().focus();
        validated = false;
    }

    if (!validated) return;


    $("#overlay").removeClass('d-none');
    try{
        const response = await fetch(`${API_END_POINT}/books/${isbn}`, 
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isbn,title,author,copies
                })
            });
        if (response.status === 204){
            showToast('Book has been updated successfully', 'success');
        }else{
            throw new Error(response.status);
        }
    }catch(error){
        showToast('Failed to update the book, try again!');
    }finally{
        $("#overlay").addClass('d-none');
    }
});