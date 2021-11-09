import db from './db.js'
import express from 'express'
import cors from 'cors'
import Sequelize from 'sequelize';
import enviarEmail from "./email.js";

const { op, col, fn } = Sequelize;

const app = express();
app.use(cors());
app.use(express.json());


app.post('/login', async(req, resp) => {
    const user = await db.infoa_dtn_tb_cliente.findOne({
        where: {
            ds_email: req.body.email,
            ds_senha: req.body.senha
        }
    })
    if (!user) {
        resp.send({status: 'erro', mensagem: 'Credenciais Inválidas'});
    } else 
        resp.send({status: 'ok', nome: user.nm_cliente});
        
})


app.post('/esqueciASenha', async(req, resp) => {
    const user = await db.infoa_dtn_tb_cliente.findOne({
        where: {
            ds_email: req.body.email
        }
    });

    if(!user) {
        return resp.send({ erro: 'E-mail Inválido'});
    }
    let code = getRandomIntereger(1000, 9999);
    await db.infoa_dtn_tb_cliente.update({
        ds_codigo_rec: code

    }, {
        where: {id_cliente: user.id_cliente}
    })
    enviarEmail(user.ds_email, 'Recuperação de E-mail', `
        <h3> Recuperação de Senha </h3>
        <p> Você solicitou a recuperação de sua senha no site Destiny. </p>
        <p> Entre com o código ${code} para prosseguir com a recuperação.
    `)
        resp.send({ status: 'ok'})
})


function getRandomIntereger(min, max){
    return Math.floor(Math.random() * (max - min) + min );
}


app.post('/validarCodigo', async (req, resp) => {
    const user = await db.infoa_dtn_tb_cliente.findOne({
        where: {
            ds_email: req.body.email
        }
    });
    if(!user) {
        resp.send( {status: 'erro', mensagem: 'Email Inválido'});
    }
    if(user.ds_codigo_rec !== req.body.codigo) {
        resp.send({ status: 'erro', mensagem: 'código inválido'})
    }
    resp.send({ status: 'ok', mensagem: 'Código Validado'});
})



app.put('/resetSenha', async (req, resp) => {
    const user = await db.infoa_dtn_tb_cliente.findOne({
        where: {
            ds_email: req.body.email
        }
    });
    if(!user) {
        resp.send( {status: 'erro', mensagem: 'Email Inválido'});
    }

    let r = await db.infoa_dtn_tb_cliente.update({
        ds_senha: req.body.novaSenha}, {where: {id_cliente: user.id_cliente}} )
        
    resp.send({ status: 'ok', mensagem: 'A senha foi alterada'})
    
})
    












app.get('/login', async(req, resp) => {
    let login = req.body;

    let r = await db.infoa_dtn_tb_cliente.findOne(
        {
            where: {
                ds_email: login.usuario,
                ds_senha: login.senha
            }
            

        })
        if(r == null)
        return resp.send({ erro: 'Credenciais Inválidas'});

        resp.sendStatus(200);
});

app.get('/produto-todos', async (req, resp) => {
    try {

        let page = req.query.page || 0;
        if (page <= 0) page = 1;

        const itemsPerPage = 15;
        const skipItems = (page-1) * itemsPerPage;

        const a = await db.infoa_dtn_tb_produto.findAll ({
            limit: itemsPerPage,
            offset: skipItems,
            order: [[ 'nm_produto', 'asc' ]],
        });
       
        const total = await db.infoa_dtn_tb_produto.findOne({
            raw: true,
            attributes: [
            [fn('count', 1 ), 'qtd']
            ]
        });
        resp.send({
            items: a,
            total: total.qtd,
            totalPaginas: Math.ceil(total.qtd/15),
            pagina: Number(page)
        });

    } catch (e) {
        resp.send({erro: e.toString()});
    }
})

app.get('/produto/:genero', async (req, resp) => {
    try {

        let page = req.query.page || 0;
        if (page <= 0) page = 1;

        const itemsPerPage = 15;
        const skipItems = (page-1) * itemsPerPage;

        const a = await db.infoa_dtn_tb_produto.findAll ({
            limit: itemsPerPage,
            offset: skipItems,
            where: { 'ds_genero': req.params.genero },
            order: [[ 'nm_produto', 'asc' ]],
        });
       
        const total = await db.infoa_dtn_tb_produto.findOne({
            raw: true,
            where: { 'ds_genero': req.params.genero },
            attributes: [
            [fn('count', 1 ), 'qtd']
            ]
        });
        resp.send({
            items: a,
            total: total.qtd,
            totalPaginas: Math.ceil(total.qtd/15),
            pagina: Number(page)
        });

    } catch (e) {
        resp.send({erro: e.toString()});
    }
})

app.get('/produto-time/:time', async (req, resp) => {
    try {

        let page = req.query.page || 0;
        if (page <= 0) page = 1;

        const itemsPerPage = 15;
        const skipItems = (page-1) * itemsPerPage;

        const a = await db.infoa_dtn_tb_produto.findAll ({
            limit: itemsPerPage,
            offset: skipItems,
            where: { 'ds_time': req.params.time },
            order: [[ 'nm_produto', 'asc' ]],
        });
       
        const total = await db.infoa_dtn_tb_produto.findOne({
            raw: true,
            where: { 'ds_time': req.params.time },
            attributes: [
            [fn('count', 1 ), 'qtd']
            ]
        });
        resp.send({
            items: a,
            total: total.qtd,
            totalPaginas: Math.ceil(total.qtd/15),
            pagina: Number(page)
        });

    } catch (e) {
        resp.send({erro: e.toString()});
    }
})

app.post('/produto', async (req, resp) => {
    try {
        let {nome, genero, descricao, categoria, preco, tamanho, img} = req.body;

        let r = await db.infoa_dtn_tb_produto.create({
            nm_produto: nome,
            ds_titulo: nome,
            ds_genero: genero,
            ds_descricao: descricao,
            ds_categoria: categoria,
            vl_preco: preco,
            id_tamanho: tamanho,
            img_imagem: img
        })
        resp.send(r);

        } catch (e) {
        resp.send({erro: e.toString()});
    }
})

app.put('/produto/:id', async (req, resp) => {
    try {
        let {nome, categoria, precode, precopor, avaliacao, descricao, estoque, imgproduto, ativo, inclusao} = req.body;
        let {id} = req.params;

        let r = await db.infoa_dtn_tb_produto.update(
            {
                nm_produto: nome,
                ds_categoria: categoria,
                vl_preco_de: precode,
                vl_preco_por: precopor,
                vl_avaliacao: avaliacao,
                ds_produto: descricao,
                qtd_estoque: estoque,
                img_produto: imgproduto,
                bt_ativo: ativo,
                dt_inclusao: inclusao
            },
            {
                where: { id_produto: id }
            }
        )
        resp.sendStatus(200);
    } catch (e) {
        resp.send({erro: e.toString()});
    }
})

app.delete('/produto/:id', async (req, resp) => {
    try {
        let {id} = req.params;

        let r = await db.infoa_dtn_tb_produto.destroy({
            where: { id_produto: id}
        })
        resp.sendStatus(200)
    } catch (e) {
        resp.send({erro: e.toString()});
    }
})

app.get('/cliente', async (req, resp) => {
    try{
        let clientes = await db.infoa_dtn_tb_cliente.findAll({order: [['id_cliente', 'desc']]})
        resp.send(clientes);
    } catch (e) {
        resp.send('Ocorreu um erro');
    }
})

app.post('/cliente', async (req, resp) => {
    try {
        let cliente = req.body

        let u = await db.infoa_dtn_tb_cliente.findOne({where: {nm_cliente: cliente.nome} })
        if (u != null)
            return resp.send({erro: 'Usuário já existe'}) 
        let r = await db.infoa_dtn_tb_cliente.create({
            nm_cliente: cliente.nome,
            ds_email: cliente.email,
            ds_senha: cliente.senha,
            dt_nascimento: cliente.nascimento
        })
        resp.send(r);
    } catch (e) {
        resp.send('Ocorreu um erro');
    }
})

app.listen(process.env.PORT, x => console.log(`subiu na porta ${process.env.PORT}`));