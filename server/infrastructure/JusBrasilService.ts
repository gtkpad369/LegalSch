
import axios from 'axios';

export class JusBrasilService {
  private static baseUrl = 'https://api.jusbrasil.com.br';
  
  static async searchProcesses(cpf: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/processes`, {
        headers: {
          'Authorization': `Bearer ${process.env.JUSBRASIL_API_KEY}`
        },
        params: { cpf }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch JusBrasil data:', error);
      return null;
    }
  }
}
