using System;
using System.Text;
using System.Threading.Tasks;
using Bolo.Data;
using Bolo.Helper;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

namespace BoloApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddHttpContextAccessor();
            services.AddCors(c => c.AddPolicy("AllowOrigin", options => options.AllowAnyOrigin().AllowAnyMethod()));
            services.AddDbContext<BoloContext>(options => 
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"), x => x.UseNetTopologySuite()));

            services.AddControllersWithViews();

            services.AddSingleton<IUserIdProvider, NameUserIdProvider>();
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidAudience = Configuration["Jwt:Issuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            // If the request is for our hub...
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) &&
                                (path.StartsWithSegments("/meetinghub") || path.StartsWithSegments("/broadcasthub") || path.StartsWithSegments("/personchathub")))
                            {
                                // Read the token out of the query string
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddSignalR(o =>
            {
                o.EnableDetailedErrors = true;
                o.KeepAliveInterval = TimeSpan.FromMinutes(1);
                o.MaximumReceiveMessageSize = null;
            });
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "clientapp/build";
            });
            //services.AddSwaggerGen();
            services.Configure<HubOptions>(options =>
            {
                options.MaximumReceiveMessageSize = null;
                
            });

            services.Configure<SmtpSetting>(Configuration.GetSection("SmtpSetting"));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseRouting();
            app.UseCors(options => options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            app.UseAuthentication();

            app.UseAuthorization();
            //app.UseSwagger();

            //app.UseSwaggerUI(c =>
            //{
            //    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Yocail API");
            //});
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<PersonChatHub>("/personchathub");
                endpoints.MapHub<UniversalHub>("/universalhub");
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
                //endpoints.MapControllerRoute(
                //    name: "default",
                //    pattern: "{controller}/{action=Index}/{id?}",
                //    new
                //    {
                //        controller = "Home",
                //        action = "Index"
                //    });

            });
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "clientapp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
