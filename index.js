const express = require('express');
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const path = require('path');
var Posts = require('./Posts.js');

const app = express();

mongoose.connect('mongodb+srv://root:dFrPbwloK4qEAnKy@cluster0.xvdlp.mongodb.net/jonanews?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('Banco de dados conectado com sucesso');
}).catch(function(err){
    console.log(err.message)
});
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/',(req,res)=>{
    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){
            // console.log(posts[0]);
            posts = posts.map(function(val){
                return{
                    titulo: val.titulo,
                    imagem: val.imagem,
                    descricaoCurta: val.conteudo.substr(0,100),
                    categoria: val.categoria,
                    conteudo: val.conteudo,
                    slug: val.slug
                }
            })

            Posts.find({}).sort({'vews': 1}).limit(4).exec(function(err,postsTop){
                 postsTop = postsTop.map(function(val){
                         return {
                             titulo: val.titulo,
                             conteudo: val.conteudo,
                             descricaoCurta: val.conteudo.substr(0,100),
                             imagem: val.imagem,
                             slug: val.slug,
                             categoria: val.categoria,
                             vews: val.vews
                         }
                 })
                 res.render('home',{posts:posts,postsTop:postsTop});
             })

            // res.render('home',{posts:posts});
        })
    }else{
        Posts.find({titulo: {$regex: req.query.busca, $options: 'i'}},function(err,posts){
            // console.log(posts);
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    vews: val.vews
                }
        })
            res.render('busca',{posts:posts,contagem:posts.length});
        })
    }
  
});


app.get('/:slug',(req,res)=>{
    // res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug},{$inc: {vews: 1}},{new: true},function(err,resposta){
        // console.log(resposta);
        if(resposta != null){
            Posts.find({}).sort({'vews': 1}).limit(4).exec(function(err,postsTop){
                postsTop = postsTop.map(function(val){
                        return {
                            titulo: val.titulo,
                            conteudo: val.conteudo,
                            descricaoCurta: val.conteudo.substr(0,100),
                            imagem: val.imagem,
                            slug: val.slug,
                            categoria: val.categoria,
                            vews: val.vews
                        }
                })
                res.render('single',{noticia:resposta,postsTop:postsTop});
            })
            // res.render('single',{noticia:resposta});
        }else{
            res.send(`
                <h1>404</h1>
                <h2>Not Found</h2>

            `);
        }
    })
})

app.listen(3000,()=>{
    console.log('server rodando!');
})