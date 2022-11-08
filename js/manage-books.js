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