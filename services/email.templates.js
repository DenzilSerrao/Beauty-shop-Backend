export const welcomeEmailTemplate = (userName) => ({
  subject: 'Welcome to Ana Beauty Shop! 🌸',
  text: `
    Dear ${userName},
    
    Welcome to Ana Beauty Shop! We're thrilled to have you join our community of beauty enthusiasts.
    
    At Ana Beauty Shop, you'll find a carefully curated selection of premium beauty products to help you look and feel your best.
    
    Start exploring our collection today and discover your new favorite beauty products!
    
    Best regards,
    The Ana Beauty Shop Team
  `,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e75480; text-align: center;">Welcome to Ana Beauty Shop! 🌸</h1>
      
      <p style="font-size: 16px;">Dear ${userName},</p>
      
      <p style="font-size: 16px;">We're thrilled to have you join our community of beauty enthusiasts!</p>
      
      <p style="font-size: 16px;">At Ana Beauty Shop, you'll find a carefully curated selection of premium beauty products to help you look and feel your best.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/ana-beauty/products" 
           style="background-color: #e75480; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  font-weight: bold;">
          Start Shopping
        </a>
      </div>
      
      <p style="font-size: 16px;">Start exploring our collection today and discover your new favorite beauty products!</p>
      
      <p style="font-size: 16px; margin-top: 30px;">
        Best regards,<br>
        The Ana Beauty Shop Team
      </p>
    </div>
  `
});