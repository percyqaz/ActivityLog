import express, {Request, Response} from 'express';
import path from 'path'

const app = express();

app.get('/api', (req: Request, res: Response) => {
    res.json({"message": "Yippee!"})
})

app.use(express.static(path.resolve(__dirname, "../../client/build")));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });

const port = process.env.PORT || 8080;
app.listen(port, () => { 
    console.log("Server running") 
});