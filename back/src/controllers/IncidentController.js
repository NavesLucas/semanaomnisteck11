const connection = require('../database/connection');

module.exports = {
    async index (request, response) {
        const { page = 1 } = request.query;

        const [count] = await connection('incidents').count()

        const incidents = await connection('incidents')
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
        .limit(5)
        .offset((page - 1) * 5)
        .select([
            'incidents.*', 
            'ongs.name', 
            'ongs.email', 
            'ongs.whatsapp', 
            'ongs.city', 
            'ongs.us'
        ]);
        
        response.header('x-Total-Count', count['count(*)']);

        return response.json(incidents);
    },

    async create(request, response ) {
        const { title, descricao, value } = request.body;
        const ong_id = request.headers.authorization;
      
        const [id] = await connection('incidents').insert({
            title,
            descricao,
            value,
            ong_id
        });

        return response.json({ id });
    },

    async delete(request, response){
        const { id } = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents')
        .where('id', id)
        .select('ong_id')
        .first();

        if(incident.ong_id != ong_id){
            return response.status(401).json({ erro: 'Operação não permitida' });
        }

        await connection('incidents').where('id', id).delete();
        
        return response.status(204).sed();
    }
};