import { useState } from "react";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { useLawyer } from "@/hooks/use-lawyer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AREAS_OF_EXPERTISE } from "@/lib/constants";
import { createSlug } from "@/lib/utils";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  oabNumber: z.string().min(3, "Número da OAB é obrigatório"),
  address: z.string().min(5, "Endereço é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  description: z.string().optional(),
  areasOfExpertise: z.array(z.string()).min(1, "Selecione pelo menos uma área de atuação"),
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
  }),
  externalLinks: z.object({
    jusbrasil: z.string().optional(),
    website: z.string().optional(),
  }),
});

export default function Profile() {
  const [previewSlug, setPreviewSlug] = useState<string>("");
  
  // Sample lawyer ID (would come from auth context in real app)
  const lawyerId = 1;
  
  // Get lawyer data
  const { lawyer, isLoading, updateLawyer, isUpdating } = useLawyer({ id: lawyerId });
  
  // Set up form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      oabNumber: "",
      address: "",
      email: "",
      phone: "",
      description: "",
      areasOfExpertise: [],
      socialLinks: {
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
      },
      externalLinks: {
        jusbrasil: "",
        website: "",
      },
    },
  });
  
  // Update form values when lawyer data is loaded
  useState(() => {
    if (lawyer) {
      form.reset({
        name: lawyer.name,
        oabNumber: lawyer.oabNumber,
        address: lawyer.address,
        email: lawyer.email,
        phone: lawyer.phone,
        description: lawyer.description || "",
        areasOfExpertise: lawyer.areasOfExpertise || [],
        socialLinks: lawyer.socialLinks || {
          facebook: "",
          twitter: "",
          linkedin: "",
          instagram: "",
        },
        externalLinks: lawyer.externalLinks || {
          jusbrasil: "",
          website: "",
        },
      });
      
      setPreviewSlug(lawyer.slug);
    }
  }, [lawyer]);
  
  // Update the slug preview when the name changes
  const handleNameChange = (name: string) => {
    const slug = createSlug(name);
    setPreviewSlug(slug);
  };
  
  // Submit form
  const handleSubmit = (data: z.infer<typeof profileSchema>) => {
    updateLawyer({
      ...data,
      slug: createSlug(data.name),
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <SidebarNavigation currentPage="/profile" />
      
      <MobileNavigation />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64 pb-16 md:pb-6">
        <PageHeader 
          title="Perfil Profissional" 
          subtitle="Gerencie suas informações profissionais"
        />
        
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500">Carregando perfil...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Seus dados de identificação e contato profissional.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Dr. Rafael Silva" 
                              onChange={(e) => {
                                field.onChange(e);
                                handleNameChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="oabNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da OAB *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="OAB/XX 123456" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="seu@email.com.br" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(11) 99999-9999" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Profissional *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Av. Paulista, 1000, Cj. 101, Bela Vista, São Paulo - SP, CEP: 01310-000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Profissionais</CardTitle>
                  <CardDescription>
                    Detalhes sobre sua atuação profissional.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Profissional</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Conte um pouco sobre sua experiência profissional e formação acadêmica." 
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="areasOfExpertise"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Áreas de Atuação *</FormLabel>
                          <FormDescription>
                            Selecione as áreas do direito em que você atua.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {AREAS_OF_EXPERTISE.map((area) => (
                            <FormField
                              key={area}
                              control={form.control}
                              name="areasOfExpertise"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={area}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(area)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, area])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== area
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {area}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Social Media and External Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais e Links Externos</CardTitle>
                  <CardDescription>
                    Links para suas redes sociais e plataformas externas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://facebook.com/seuusuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://instagram.com/seuusuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://linkedin.com/in/seuusuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://twitter.com/seuusuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="externalLinks.jusbrasil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>JusBrasil</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://jusbrasil.com.br/seuusuario" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="externalLinks.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website Pessoal</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://seusite.com.br" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Public Profile URL Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>URL Pública</CardTitle>
                  <CardDescription>
                    Seu perfil público estará disponível neste endereço.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <p className="text-primary font-mono">
                      https://jurisagenda.com.br/book/{previewSlug || "seu-nome"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </main>
    </div>
  );
}
